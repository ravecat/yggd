#!/usr/bin/env node
/**
 * Generate TypeScript types and Zod v4 schemas from AsyncAPI spec.
 * Run: node scripts/generate-asyncapi-types.mjs
 */
import { parse } from "yaml";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const SPEC_PATH = join(ROOT, "apps/ash_framework/priv/specs/asyncapi.yaml");
const OUT_DIR = join(ROOT, "packages/shared/src/channels");
const MODELS_DIR = join(OUT_DIR, "models");
const ZOD_DIR = join(OUT_DIR, "zod");

const HEADER = [
  "/**",
  " * Generated from AsyncAPI spec (asyncapi.yaml).",
  " * Do not edit manually.",
  " */",
  "",
].join("\n");

// ---------------------------------------------------------------------------
// Naming
// ---------------------------------------------------------------------------

function pascalCase(s) {
  return s.replace(/(^|[^a-zA-Z0-9])([a-zA-Z])/g, (_, _p, c) =>
    c.toUpperCase(),
  );
}

function camelCase(s) {
  const p = pascalCase(s);
  return p[0].toLowerCase() + p.slice(1);
}

// ---------------------------------------------------------------------------
// Parse spec
// ---------------------------------------------------------------------------

const spec = parse(readFileSync(SPEC_PATH, "utf-8"));
const schemas = spec.components.schemas;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function refName(ref) {
  return ref.replace("#/components/schemas/", "");
}

function isBinary(schema) {
  return schema?.type === "string" && schema?.format === "binary";
}

/** Collect all $ref schema names used in a schema tree. */
function collectRefs(schema, refs = new Set()) {
  if (!schema || typeof schema !== "object") return refs;
  if (schema.$ref) {
    refs.add(refName(schema.$ref));
    return refs;
  }
  for (const val of Object.values(schema)) {
    if (Array.isArray(val)) {
      for (const item of val) collectRefs(item, refs);
    } else if (typeof val === "object" && val !== null) {
      collectRefs(val, refs);
    }
  }
  return refs;
}

// ---------------------------------------------------------------------------
// TypeScript type generator
// ---------------------------------------------------------------------------

function tsType(schema, depth) {
  if (!schema) return "unknown";
  if (schema.$ref) return pascalCase(refName(schema.$ref));
  if (schema.const !== undefined) return JSON.stringify(schema.const);

  if (schema.oneOf) {
    return schema.oneOf.map((s) => tsType(s, depth)).join(" | ");
  }

  if (isBinary(schema)) return "ArrayBuffer";
  if (schema.type === "string") return "string";
  if (schema.type === "number" || schema.type === "integer") return "number";
  if (schema.type === "boolean") return "boolean";

  if (schema.type === "array") {
    const item = tsType(schema.items, depth);
    return schema.items?.oneOf ? `(${item})[]` : `${item}[]`;
  }

  if (schema.type === "object") {
    if (!schema.properties) return "Record<string, unknown>";
    return tsObject(schema, depth);
  }

  return "unknown";
}

function tsObject(schema, depth) {
  const pad = "  ".repeat(depth);
  const inner = "  ".repeat(depth + 1);
  const required = new Set(schema.required || []);
  const lines = [];

  for (const [key, prop] of Object.entries(schema.properties || {})) {
    const opt = required.has(key) ? "" : "?";
    lines.push(`${inner}${key}${opt}: ${tsType(prop, depth + 1)};`);
  }

  if (schema.additionalProperties === true) {
    lines.push(`${inner}[key: string]: unknown;`);
  }

  return `{\n${lines.join("\n")}\n${pad}}`;
}

function generateModel(name, schema) {
  const typeName = pascalCase(name);
  const refs = [...collectRefs(schema)].filter((r) => r !== name);
  const imports = refs.map(
    (r) => `import type { ${pascalCase(r)} } from "./${pascalCase(r)}.js";`,
  );

  const parts = [HEADER];
  if (imports.length) parts.push(imports.join("\n"), "");

  if (isBinary(schema)) {
    parts.push(`export type ${typeName} = ArrayBuffer;`, "");
    return parts.join("\n");
  }

  if (schema.oneOf) {
    const variants = schema.oneOf.map((s) => `  | ${tsType(s, 2)}`);
    parts.push(`export type ${typeName} =`, ...variants, ";", "");
    return parts.join("\n");
  }

  if (schema.type === "object" && schema.properties) {
    parts.push(`export interface ${typeName} ${tsObject(schema, 0)}`, "");
    return parts.join("\n");
  }

  parts.push(`export type ${typeName} = ${tsType(schema, 0)};`, "");
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Zod schema generator
// ---------------------------------------------------------------------------

function zodExpr(schema, depth) {
  if (!schema) return "z.unknown()";
  if (schema.$ref) return `${camelCase(refName(schema.$ref))}Schema`;
  if (schema.const !== undefined)
    return `z.literal(${JSON.stringify(schema.const)})`;

  if (schema.oneOf) {
    const inner = "  ".repeat(depth + 1);
    const pad = "  ".repeat(depth);
    const variants = schema.oneOf.map(
      (s) => `${inner}${zodExpr(s, depth + 1)},`,
    );
    return `z.union([\n${variants.join("\n")}\n${pad}])`;
  }

  if (schema.type === "string") return "z.string()";
  if (schema.type === "number" || schema.type === "integer")
    return "z.number()";
  if (schema.type === "boolean") return "z.boolean()";

  if (schema.type === "array") {
    return `z.array(${zodExpr(schema.items, depth)})`;
  }

  if (schema.type === "object") {
    if (!schema.properties) return "z.record(z.string(), z.unknown())";
    return zodObject(schema, depth);
  }

  return "z.unknown()";
}

function zodObject(schema, depth) {
  const pad = "  ".repeat(depth);
  const inner = "  ".repeat(depth + 1);
  const required = new Set(schema.required || []);
  const lines = [];

  for (const [key, prop] of Object.entries(schema.properties || {})) {
    let expr = zodExpr(prop, depth + 1);
    if (!required.has(key)) expr += ".optional()";
    lines.push(`${inner}${key}: ${expr},`);
  }

  let result = `z.object({\n${lines.join("\n")}\n${pad}})`;
  if (schema.additionalProperties === true) result += ".passthrough()";
  return result;
}

function generateZod(name, schema) {
  const schemaVarName = `${camelCase(name)}Schema`;
  const refs = [...collectRefs(schema)].filter(
    (r) => r !== name && !isBinary(schemas[r]),
  );
  const refImports = refs.map(
    (r) =>
      `import { ${camelCase(r)}Schema } from "./${camelCase(r)}Schema.js";`,
  );

  const parts = [HEADER];
  parts.push(`import { z } from "zod/v4";`);
  if (refImports.length) parts.push(...refImports);
  parts.push("");
  parts.push(`export const ${schemaVarName} = ${zodExpr(schema, 0)};`, "");
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(MODELS_DIR, { recursive: true });
mkdirSync(ZOD_DIR, { recursive: true });

const modelExports = [];
const zodExports = [];

for (const [name, schema] of Object.entries(schemas)) {
  const typeName = pascalCase(name);

  writeFileSync(
    join(MODELS_DIR, `${typeName}.ts`),
    generateModel(name, schema),
  );
  modelExports.push(`export type { ${typeName} } from "./${typeName}.js";`);

  if (!isBinary(schema)) {
    const zodFileName = `${camelCase(name)}Schema`;
    writeFileSync(
      join(ZOD_DIR, `${zodFileName}.ts`),
      generateZod(name, schema),
    );
    zodExports.push(`export { ${zodFileName} } from "./${zodFileName}.js";`);
  }
}

writeFileSync(
  join(MODELS_DIR, "index.ts"),
  `${HEADER}\n${modelExports.join("\n")}\n`,
);
writeFileSync(
  join(ZOD_DIR, "index.ts"),
  `${HEADER}\n${zodExports.join("\n")}\n`,
);
writeFileSync(
  join(OUT_DIR, "index.ts"),
  `${HEADER}\nexport * from "./models/index.js";\nexport * from "./zod/index.js";\n`,
);
writeFileSync(join(OUT_DIR, ".gitattributes"), "* linguist-generated=true\n");

const total = Object.keys(schemas).length;
const zodCount = Object.values(schemas).filter((s) => !isBinary(s)).length;
console.log(`Generated ${total} types + ${zodCount} Zod schemas -> ${OUT_DIR}`);

execSync(`npx prettier --write "${join(OUT_DIR, "**/*.ts")}"`, {
  cwd: ROOT,
  stdio: "inherit",
});
