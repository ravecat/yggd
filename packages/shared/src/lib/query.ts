import qs from "qs";
import { z } from "zod/v4";

type QueryParamsInput = Record<string, unknown>;
type AnyZodSchema = z.ZodTypeAny;

type QueryParamsSchema<TQueryParams extends QueryParamsInput> =
  z.ZodType<TQueryParams>;

function isQueryParamsInput(value: unknown): value is QueryParamsInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRawQueryString(queryString: string): QueryParamsInput {
  const normalizedQueryString = queryString.replace(/%2C/gi, ",");

  return qs.parse(normalizedQueryString, {
    ignoreQueryPrefix: true,
    comma: true,
    depth: 20,
    parameterLimit: 1000,
    parseArrays: true,
    allowPrototypes: false,
    plainObjects: true,
  }) as QueryParamsInput;
}

const WRAPPER_SCHEMA_TYPES = new Set([
  "optional",
  "nullable",
  "default",
  "prefault",
  "nonoptional",
  "success",
  "catch",
  "readonly",
  "lazy",
]);

function unwrapSchema(schema: AnyZodSchema): AnyZodSchema {
  let currentSchema = schema;

  while (
    WRAPPER_SCHEMA_TYPES.has(currentSchema._def.type) &&
    typeof (currentSchema as unknown as { unwrap?: () => AnyZodSchema })
      .unwrap === "function"
  ) {
    const nextSchema = (
      currentSchema as unknown as { unwrap: () => AnyZodSchema }
    ).unwrap();

    if (nextSchema === currentSchema) {
      break;
    }

    currentSchema = nextSchema;
  }

  return currentSchema;
}

function getSchemaType(schema: AnyZodSchema | undefined): string | undefined {
  return schema
    ? (unwrapSchema(schema)._def.type as string | undefined)
    : undefined;
}

function getObjectShape(
  schema: AnyZodSchema,
): Record<string, AnyZodSchema> | undefined {
  const unwrappedSchema = unwrapSchema(schema);

  if (getSchemaType(unwrappedSchema) !== "object") {
    return undefined;
  }

  return (
    unwrappedSchema as AnyZodSchema & {
      shape: Record<string, AnyZodSchema>;
    }
  ).shape;
}

function getObjectCatchall(schema: AnyZodSchema): AnyZodSchema | undefined {
  const unwrappedSchema = unwrapSchema(schema);

  if (getSchemaType(unwrappedSchema) !== "object") {
    return undefined;
  }

  return (
    unwrappedSchema as AnyZodSchema & {
      _def: {
        catchall?: AnyZodSchema;
      };
    }
  )._def.catchall;
}

function normalizeParsedQueryValue(
  value: unknown,
  schema: AnyZodSchema | undefined,
): unknown {
  const schemaType = getSchemaType(schema);

  if (schemaType === "array") {
    if (value === undefined) {
      return value;
    }

    return Array.isArray(value) ? value : [value];
  }

  if (schemaType === "object" && isQueryParamsInput(value)) {
    const shape = getObjectShape(schema as AnyZodSchema) ?? {};
    const catchall = getObjectCatchall(schema as AnyZodSchema);
    const normalizedObject: QueryParamsInput = { ...value };

    for (const [key, nestedValue] of Object.entries(value)) {
      normalizedObject[key] = normalizeParsedQueryValue(
        nestedValue,
        shape[key] ?? catchall,
      );
    }

    return normalizedObject;
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value.join(",");
}

function normalizeJsonApiQueryParamsInput(
  queryParams: QueryParamsInput,
  queryParamsSchema: AnyZodSchema,
): QueryParamsInput {
  return normalizeParsedQueryValue(
    queryParams,
    queryParamsSchema,
  ) as QueryParamsInput;
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
  const rawQueryParams = parseRawQueryString(queryString);

  return queryParamsSchema.parse(
    normalizeJsonApiQueryParamsInput(rawQueryParams, queryParamsSchema),
  );
}

function stringifyQueryParamsInput(queryParams: QueryParamsInput): string {
  return qs.stringify(queryParams, {
    arrayFormat: "comma",
    encodeValuesOnly: true,
    allowDots: false,
    skipNulls: true,
  });
}

function toQueryString<
  TQueryParams extends QueryParamsInput = QueryParamsInput,
>(queryParams: Partial<TQueryParams>): string {
  return stringifyQueryParamsInput(queryParams);
}

function toHref<TQueryParams extends QueryParamsInput = QueryParamsInput>(
  href: string,
  params: Partial<TQueryParams>,
  queryParamsSchema: QueryParamsSchema<TQueryParams>,
): string {
  const { base, query, hash } = splitHrefParts(href);
  const mergedParams = mergeQueryParams(
    normalizeJsonApiQueryParamsInput(
      parseRawQueryString(query),
      queryParamsSchema,
    ),
    params,
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
      return toHref(href, params, queryParamsSchema);
    },
  };
}
