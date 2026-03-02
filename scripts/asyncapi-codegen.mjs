#!/usr/bin/env node
// @ts-check
/**
 * Generate TypeScript types and Zod v4 schemas from AsyncAPI spec
 * using @asyncapi/parser + JSON Schema converters.
 * Run:
 *   node scripts/asyncapi-codegen.mjs --input apps/ash_framework/priv/specs/asyncapi.yaml
 *   node scripts/asyncapi-codegen.mjs --input apps/ash_framework/priv/specs/asyncapi.yaml --out packages/shared/src/channels
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { execSync } from "node:child_process";
import { Parser, DiagnosticSeverity } from "@asyncapi/parser";
import { compile } from "json-schema-to-typescript";
import { jsonSchemaToZod } from "json-schema-to-zod";

/** @typedef {import("json-schema-to-typescript").JSONSchema} JsonSchema */
/** @typedef {Record<string, unknown>} JsonObject */
/** @typedef {(node: JsonObject) => JsonObject} SchemaPlugin */
/** @typedef {(value: string) => string} CodePlugin */
/** @typedef {{ input?: string, out: string, help?: boolean }} CliValues */

const HELP = `
Usage: node ./asyncapi-codegen.mjs --input <path-to-asyncapi.{yaml|json}> [--out <output-dir>]

Options:
  -i, --input <path>  Path to AsyncAPI spec (.yaml or .json). Required.
  -o, --out <dir>     Output directory. Default: ./asyncapi
  -h, --help          Show this help message.

Examples:
  node ./asyncapi-codegen.mjs --input specs/asyncapi.yaml
  node ./asyncapi-codegen.mjs --input ./specs/asyncapi.yaml --out ./output/asyncapi
`;

/** @type {CliValues} */
let values;

try {
  ({ values } = parseArgs({
    options: {
      input: { type: "string", short: "i" },
      out: { type: "string", short: "o", default: "asyncapi" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  }));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`${message}\n\n${HELP}`);
}

if (values.help) {
  console.log(HELP);
  process.exit(0);
}

if (!values.input) {
  throw new Error(`Missing required --input parameter.\n\n${HELP}`);
}

const root = process.cwd();
const specPath = resolve(root, values.input);
const outDir = resolve(root, values.out);
const modelsDir = join(outDir, "models");
const zodDir = join(outDir, "zod");

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

/**
 * @param {string} s
 * @returns {string}
 */
function pascalCase(s) {
  return s.replace(/(^|[^a-zA-Z0-9])([a-zA-Z])/g, (_, _p, c) =>
    c.toUpperCase(),
  );
}

/**
 * @param {string} s
 * @returns {string}
 */
function camelCase(s) {
  const p = pascalCase(s);
  return p[0].toLowerCase() + p.slice(1);
}

// ---------------------------------------------------------------------------
// Parse + validate spec
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    return applySchemaPlugins(traversed, plugins);
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
  // json-schema-to-zod emits Zod v3-only superRefine for oneOf.
  // In this project we target zod/v4 and previous generator behavior matched union semantics.
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

// ---------------------------------------------------------------------------
// TypeScript + Zod generators
// ---------------------------------------------------------------------------

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
    bannerComment: `/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */`,
    format: false,
  });
}

/**
 * @param {string} name
 * @param {JsonSchema} schema
 * @returns {string}
 */
function generateZod(name, schema) {
  const schemaName = camelCase(name);
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

  return `/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const ${schemaName} = ${expression};
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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

for (const [name, schema] of schemas) {
  const typeName = pascalCase(name);

  writeFileSync(
    join(modelsDir, `${typeName}.ts`),
    await generateModel(name, schema),
  );
  modelExports.push(`export type { ${typeName} } from "./${typeName}.js";`);

  const zodFileName = `${camelCase(name)}Schema`;
  writeFileSync(join(zodDir, `${zodFileName}.ts`), generateZod(name, schema));
  zodExports.push(`export { ${zodFileName} } from "./${zodFileName}.js";`);
}

writeFileSync(
  join(modelsDir, "index.ts"),
  `/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

${modelExports.join("\n")}
`,
);
writeFileSync(
  join(zodDir, "index.ts"),
  `/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

${zodExports.join("\n")}
`,
);
writeFileSync(
  join(outDir, "index.ts"),
  `/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

export * from "./models/index.js";
export * from "./zod/index.js";
`,
);
writeFileSync(join(outDir, ".gitattributes"), "* linguist-generated=true\n");

const total = schemas.length;
const zodCount = schemas.length;

console.log(`Generated ${total} types + ${zodCount} Zod schemas -> ${outDir}`);

execSync(`npx prettier --write "${join(outDir, "**/*.ts")}"`, {
  cwd: root,
  stdio: "inherit",
});
