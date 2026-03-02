// @ts-check
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { Parser, DiagnosticSeverity } from "@asyncapi/parser";
import { compile } from "json-schema-to-typescript";
import { jsonSchemaToZod } from "json-schema-to-zod";
import prettier from "prettier";

/** @typedef {import("json-schema-to-typescript").JSONSchema} JsonSchema */
/** @typedef {Record<string, unknown>} JsonObject */
/** @typedef {(node: JsonObject) => JsonObject} SchemaPlugin */
/** @typedef {(value: string) => string} CodePlugin */
/** @typedef {{ input: string, out: string, cwd?: string }} GenerateOptions */

const BANNER = `/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */`;

/**
 * @param {string} value
 * @returns {string}
 */
function pascalCase(value) {
  return value.replace(/(^|[^a-zA-Z0-9])([a-zA-Z])/g, (_, _p, c) =>
    c.toUpperCase(),
  );
}

/**
 * @param {string} value
 * @returns {string}
 */
function camelCase(value) {
  const p = pascalCase(value);
  return p[0].toLowerCase() + p.slice(1);
}

/**
 * @param {JsonObject} node
 * @param {SchemaPlugin[]} plugins
 * @returns {JsonObject}
 */
function applySchemaPlugins(node, plugins) {
  return plugins.reduce((current, plugin) => plugin(current), node);
}

/**
 * @param {unknown} value
 * @param {SchemaPlugin[]} [plugins]
 * @returns {unknown}
 */
function traverseSchema(value, plugins = []) {
  if (Array.isArray(value)) {
    return value.map((item) => traverseSchema(item, plugins));
  }
  if (value && typeof value === "object") {
    const traversed = Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        traverseSchema(nested, plugins),
      ]),
    );
    return applySchemaPlugins(/** @type {JsonObject} */ (traversed), plugins);
  }
  return value;
}

/**
 * @param {JsonObject} node
 * @returns {JsonObject}
 */
function withBinaryArrayBufferTsType(node) {
  if (node?.type === "string" && node?.format === "binary") {
    return { ...node, tsType: "ArrayBuffer" };
  }
  return node;
}

/**
 * @param {JsonObject} node
 * @returns {JsonObject}
 */
function withOneOfAsAnyOfForZod(node) {
  if (Array.isArray(node.oneOf) && node.anyOf === undefined) {
    const next = { ...node };
    next.anyOf = next.oneOf;
    delete next.oneOf;
    return next;
  }
  return node;
}

/**
 * @param {JsonObject} node
 * @returns {string | undefined}
 */
function withBinaryArrayBufferZodParser(node) {
  if (node?.type === "string" && node?.format === "binary") {
    return "z.instanceof(ArrayBuffer)";
  }
  return undefined;
}

/**
 * @param {string} value
 * @param {CodePlugin[]} plugins
 * @returns {string}
 */
function applyCodePlugins(value, plugins) {
  return plugins.reduce((current, plugin) => plugin(current), value);
}

/**
 * @param {string} name
 * @param {JsonSchema} schema
 * @returns {Promise<string>}
 */
async function generateModel(name, schema) {
  const typeName = pascalCase(name);
  const tsSchema = /** @type {JsonSchema} */ (
    traverseSchema(schema, [withBinaryArrayBufferTsType])
  );

  return compile(tsSchema, typeName, {
    additionalProperties: false,
    bannerComment: BANNER,
    format: false,
  });
}

/**
 * @param {string} name
 * @param {JsonSchema} schema
 * @returns {string}
 */
function generateZod(name, schema) {
  const schemaConstName = camelCase(name);
  const zodSchema = /** @type {JsonSchema} */ (
    traverseSchema(schema, [withOneOfAsAnyOfForZod])
  );
  const expression = applyCodePlugins(
    jsonSchemaToZod(zodSchema, {
      parserOverride: withBinaryArrayBufferZodParser,
    }),
    [
      (value) => value.replaceAll("z.record(", "z.record(z.string(), "),
      (value) => value.replaceAll("z.any()", "z.unknown()"),
      (value) => value.trim().replace(/;$/, ""),
    ],
  );

  return `${BANNER}

import { z } from "zod/v4";

export const ${schemaConstName} = ${expression};
`;
}

/**
 * @param {string[]} files
 * @param {string} cwd
 * @returns {Promise<void>}
 */
async function formatFiles(files, cwd) {
  const config = await prettier.resolveConfig(cwd);

  for (const file of files) {
    const source = readFileSync(file, "utf-8");
    const formatted = await prettier.format(source, {
      ...(config ?? {}),
      filepath: file,
    });
    writeFileSync(file, formatted);
  }
}

/**
 * @param {GenerateOptions} options
 * @returns {Promise<{ total: number, zodCount: number, outDir: string }>}
 */
export async function generateAsyncApiArtifacts(options) {
  const root = options.cwd ?? process.cwd();
  const specPath = resolve(root, options.input);
  const outDir = resolve(root, options.out);
  const modelsDir = join(outDir, "models");
  const zodDir = join(outDir, "zod");

  const parser = new Parser();
  const source = readFileSync(specPath, "utf-8");
  const { document, diagnostics } = await parser.parse(source);

  for (const diagnostic of diagnostics) {
    const path = Array.isArray(diagnostic.path)
      ? diagnostic.path.join(".")
      : "<root>";
    console.log(`[asyncapi] ${path}: ${diagnostic.message}`);
  }

  const fatalDiagnostics = diagnostics.filter(
    (diagnostic) => diagnostic.severity === DiagnosticSeverity.Error,
  );

  if (fatalDiagnostics.length > 0 || !document) {
    throw new Error(
      `AsyncAPI parse failed with ${fatalDiagnostics.length} error(s).`,
    );
  }

  const schemaCollection = document.components()?.schemas?.();
  if (!schemaCollection) {
    throw new Error("No components.schemas found in AsyncAPI document.");
  }

  for (const target of [
    modelsDir,
    zodDir,
    join(outDir, "index.ts"),
    join(outDir, ".gitattributes"),
  ]) {
    rmSync(target, { recursive: true, force: true });
  }

  mkdirSync(modelsDir, { recursive: true });
  mkdirSync(zodDir, { recursive: true });

  const modelExports = [];
  const zodExports = [];

  /** @type {Array<[string, JsonSchema]>} */
  const schemas = [];
  for (const schemaModel of schemaCollection) {
    const schema = /** @type {JsonSchema} */ (schemaModel.json());
    schemas.push([schemaModel.id(), schema]);
  }

  /** @type {string[]} */
  const filesToFormat = [];

  for (const [name, schema] of schemas) {
    const typeName = pascalCase(name);
    const modelPath = join(modelsDir, `${typeName}.ts`);

    writeFileSync(modelPath, await generateModel(name, schema));
    filesToFormat.push(modelPath);
    modelExports.push(`export type { ${typeName} } from "./${typeName}.js";`);

    const zodExportName = camelCase(name);
    const zodFileName = `${zodExportName}Schema`;
    const zodPath = join(zodDir, `${zodFileName}.ts`);

    writeFileSync(zodPath, generateZod(name, schema));
    filesToFormat.push(zodPath);
    zodExports.push(`export { ${zodExportName} } from "./${zodFileName}.js";`);
  }

  const modelsIndexPath = join(modelsDir, "index.ts");
  writeFileSync(
    modelsIndexPath,
    `${BANNER}

${modelExports.join("\n")}
`,
  );
  filesToFormat.push(modelsIndexPath);

  const zodIndexPath = join(zodDir, "index.ts");
  writeFileSync(
    zodIndexPath,
    `${BANNER}

${zodExports.join("\n")}
`,
  );
  filesToFormat.push(zodIndexPath);

  const rootIndexPath = join(outDir, "index.ts");
  writeFileSync(
    rootIndexPath,
    `${BANNER}

export * from "./models/index.js";
export * from "./zod/index.js";
`,
  );
  filesToFormat.push(rootIndexPath);

  writeFileSync(join(outDir, ".gitattributes"), "* linguist-generated=true\n");

  await formatFiles(filesToFormat, root);

  return {
    total: schemas.length,
    zodCount: schemas.length,
    outDir,
  };
}
