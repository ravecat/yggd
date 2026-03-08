import {
  parseQuery as sharedParseQuery,
  parseQueryParams as sharedParseQueryParams,
  type QueryParamsSchema,
  stringifyQuery as sharedStringifyQuery,
} from "@rvct/shared";
import type { SearchParams } from "../types/query";

function toQueryString(
  params: Record<string, string | string[] | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      continue;
    }

    searchParams.append(key, value);
  }

  return searchParams.toString();
}

/**
 * Parses Next.js searchParams with bracket notation into a nested object structure.
 *
 * Without a schema it returns the raw nested query object.
 * With a schema it validates and coerces the result into the generated query contract.
 *
 * This keeps framework adaptation local while letting the rest of the app work
 * against the transport contract expected by generated client functions.
 *
 * @example
 * import type { GetTodosQueryParams } from "@rvct/shared";
 * import { getTodosQueryParamsSchema } from "@rvct/shared";
 *
 * const params = await searchParams;
 * const query = parseQuery(getTodosQueryParamsSchema, params);
 * // query is typed as GetTodosQueryParams
 */
export function parseQuery(
  params: SearchParams<Record<string, unknown>>,
): Record<string, unknown>;
export function parseQuery<TQueryParams extends Record<string, unknown>>(
  schema: QueryParamsSchema<TQueryParams>,
  params: SearchParams<TQueryParams>,
): TQueryParams;
export function parseQuery<TQueryParams extends Record<string, unknown>>(
  schemaOrParams: QueryParamsSchema<TQueryParams> | SearchParams<TQueryParams>,
  maybeParams?: SearchParams<TQueryParams>,
): Record<string, unknown> | TQueryParams {
  const params = maybeParams ?? (schemaOrParams as SearchParams<TQueryParams>);
  const parsed = sharedParseQuery(toQueryString(params));

  if (!maybeParams) {
    return parsed;
  }

  return sharedParseQueryParams(
    schemaOrParams as QueryParamsSchema<TQueryParams>,
    parsed,
  );
}

/**
 * Stringifies a nested object structure into a query string with bracket notation.
 *
 * This is a Next.js-specific wrapper around the shared stringifyQuery function.
 *
 * @template TQueryParams - Query params type (e.g., GetTodosQueryParams)
 * @param params - Query params matching the generated contract
 * @returns Query string ready to append to a URL
 *
 * @example
 * const query = stringifyQuery({
 *   page: { limit: 10, offset: 0 },
 *   sort: "title"
 * });
 * // Returns: "page[limit]=10&page[offset]=0&sort=title"
 *
 * const url = `/?${query}`;
 * // Results in: /?page[limit]=10&page[offset]=0&sort=title
 */
export function stringifyQuery<TQueryParams = Record<string, unknown>>(
  params: Partial<TQueryParams>,
): string {
  return sharedStringifyQuery<TQueryParams>(params);
}
