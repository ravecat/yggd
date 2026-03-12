import qs from "qs";
import type { z } from "zod/v4";

type QueryParamsInput = Record<string, unknown>;

export type QueryParamsSchema<TQueryParams extends QueryParamsInput> =
  z.ZodType<TQueryParams>;

function parseRawQueryString(queryString: string): QueryParamsInput {
  return qs.parse(queryString, {
    ignoreQueryPrefix: true,
    depth: 20,
    parameterLimit: 1000,
    parseArrays: true,
    allowPrototypes: false,
    plainObjects: true,
  }) as QueryParamsInput;
}

function isQueryParamsInput(value: unknown): value is QueryParamsInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeQueryParams(
  current: QueryParamsInput,
  patch: QueryParamsInput,
): QueryParamsInput {
  const merged: QueryParamsInput = { ...current };

  for (const [key, nextValue] of Object.entries(patch)) {
    if (nextValue === undefined) {
      delete merged[key];
      continue;
    }

    const currentValue = merged[key];

    if (isQueryParamsInput(currentValue) && isQueryParamsInput(nextValue)) {
      const nested = mergeQueryParams(currentValue, nextValue);

      if (Object.keys(nested).length === 0) {
        delete merged[key];
      } else {
        merged[key] = nested;
      }

      continue;
    }

    merged[key] = nextValue;
  }

  return merged;
}

function splitQueryHref(href: string) {
  const [hrefWithoutHash, hashPart] = href.split("#", 2);
  const [pathname, query] = hrefWithoutHash.split("?", 2);

  return {
    pathname,
    query: query ?? "",
    hash: hashPart ? `#${hashPart}` : "",
  };
}

export function parseQueryString<TQueryParams extends QueryParamsInput>(
  queryString: string,
  queryParamsSchema: QueryParamsSchema<TQueryParams>,
): TQueryParams {
  return queryParamsSchema.parse(parseRawQueryString(queryString));
}

export function toQueryString<TQueryParams = QueryParamsInput>(
  queryParams: Partial<TQueryParams>,
): string {
  return qs.stringify(queryParams as Record<string, unknown>, {
    arrayFormat: "indices",
    encodeValuesOnly: true,
    allowDots: false,
    skipNulls: true,
  });
}

export function toQueryHref<TQueryParams = QueryParamsInput>(
  pathname: string,
  params: Partial<TQueryParams>,
): string {
  const query = toQueryString(params);

  return query.length > 0 ? `${pathname}?${query}` : pathname;
}

export function mergeQueryHref<TQueryParams = QueryParamsInput>(
  href: string,
  params: Partial<TQueryParams>,
): string {
  const { pathname, query, hash } = splitQueryHref(href);
  const mergedParams = mergeQueryParams(
    parseRawQueryString(query),
    params as QueryParamsInput,
  );
  const serializedQuery = toQueryString(mergedParams);
  const nextHref =
    serializedQuery.length > 0 ? `${pathname}?${serializedQuery}` : pathname;

  return `${nextHref}${hash}`;
}
