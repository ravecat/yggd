#!/usr/bin/env node
// @ts-check
import { parseArgs } from "node:util";
import { generateAsyncApiArtifacts } from "./generate.mjs";

/** @typedef {{ input?: string, out: string, help?: boolean }} CliValues */

const HELP = `
Usage: asyncapi-codegen --input <path-to-asyncapi.{yaml|json}> [--out <output-dir>]

Options:
  -i, --input <path>  Path to AsyncAPI spec (.yaml or .json). Required.
  -o, --out <dir>     Output directory. Default: ./asyncapi
  -h, --help          Show this help message.

Examples:
  asyncapi-codegen --input ./specs/asyncapi.yaml
  asyncapi-codegen --input ./specs/asyncapi.yaml --out ./output/asyncapi
`;

/**
 * @param {string[]} args
 * @returns {Promise<void>}
 */
export async function runCli(args = process.argv.slice(2)) {
  /** @type {CliValues} */
  let values;

  try {
    ({ values } = parseArgs({
      args,
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
    return;
  }

  if (!values.input) {
    throw new Error(`Missing required --input parameter.\n\n${HELP}`);
  }

  const result = await generateAsyncApiArtifacts({
    input: values.input,
    out: values.out,
  });

  console.log(
    `Generated ${result.total} types + ${result.zodCount} Zod schemas -> ${result.outDir}`,
  );
}

runCli().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
