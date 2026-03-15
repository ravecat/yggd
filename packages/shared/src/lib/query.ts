import qs from "qs";
import type { z } from "zod/v4";

type QueryParamsInput = Record<string, unknown>;

type QueryParamsSchema<TQueryParams extends QueryParamsInput> =
  z.ZodType<TQueryParams>;

function toQueryParamsInput(value: unknown): QueryParamsInput {
  return isQueryParamsInput(value) ? value : {};
}

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

function splitHrefParts(href: string) {
  const hashIndex = href.indexOf("#");
  const hrefWithoutHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const queryIndex = hrefWithoutHash.indexOf("?");
  const base =
    queryIndex === -1 ? hrefWithoutHash : hrefWithoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : hrefWithoutHash.slice(queryIndex + 1);

  return {
    base,
    query,
    hash,
  };
}

function parseQueryString<TQueryParams extends QueryParamsInput>(
  queryString: string,
  queryParamsSchema: QueryParamsSchema<TQueryParams>,
): TQueryParams {
  return queryParamsSchema.parse(parseRawQueryString(queryString));
}

function stringifyQueryParamsInput(queryParams: QueryParamsInput): string {
  return qs.stringify(queryParams, {
    arrayFormat: "indices",
    encodeValuesOnly: true,
    allowDots: false,
    skipNulls: true,
  });
}

function toQueryString<
  TQueryParams extends QueryParamsInput = QueryParamsInput,
>(queryParams: Partial<TQueryParams>): string {
  return stringifyQueryParamsInput(toQueryParamsInput(queryParams));
}

function toHref<TQueryParams extends QueryParamsInput = QueryParamsInput>(
  href: string,
  params: Partial<TQueryParams>,
): string {
  const { base, query, hash } = splitHrefParts(href);
  const mergedParams = mergeQueryParams(
    parseRawQueryString(query),
    toQueryParamsInput(params),
  );

  const serializedQuery = stringifyQueryParamsInput(mergedParams);
  const nextHref =
    serializedQuery.length > 0 ? `${base}?${serializedQuery}` : base;

  return `${nextHref}${hash}`;
}

export function createQueryCodec<TQueryParams extends QueryParamsInput>(
  queryParamsSchema: QueryParamsSchema<TQueryParams>,
) {
  return {
    parse(queryString: string): TQueryParams {
      return parseQueryString(queryString, queryParamsSchema);
    },
    stringify(queryParams: Partial<TQueryParams>): string {
      return toQueryString(queryParams);
    },
    toHref(href: string, params: Partial<TQueryParams>): string {
      return toHref(href, params);
    },
  };
}
