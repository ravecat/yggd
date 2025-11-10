/**
 * Type representing a flat query parameter object with string values.
 * Used for URL query parameters where all values are strings or arrays of strings.
 * 
 * This is a generic type that can be used in any context where query parameters
 * need to be represented as flat key-value pairs (URL params, API requests, etc.).
 */
export type FlatQueryParams = Record<string, string | string[] | undefined>;

/**
 * Primitive types that can be present in query parameters after deserialization.
 */
type QueryPrimitive = string | number | boolean;

/**
 * Recursive type representing possible query parameter structures.
 * Query parameters can be:
 * - Primitives (string, number, boolean)
 * - Arrays of primitives
 * - Nested objects containing other query values
 */
export type QueryValue =
  | QueryPrimitive
  | QueryPrimitive[]
  | { [key: string]: QueryValue };

/**
 * Default type for query parameters - an object with string keys and query values.
 */
export type QueryParams = Record<string, QueryValue>;

/**
 * Type utilities for converting nested object structures to flat format
 * with bracket notation support.
 */

/**
 * Utility type that recursively flattens nested object keys into bracket notation.
 * Converts structures like `{ page: { limit: number } }` into `{ "page[limit]": string }`.
 * 
 * This type handles:
 * - Primitives (string, number, boolean) - kept as-is
 * - Nested objects - converted to bracket notation
 * - Deep nesting - recursively processed
 * - Optional fields - preserved
 * 
 * @example
 * type Input = { page: { limit: number; offset: number }; sort: string };
 * type Output = FlattenToBracketNotation<Input>;
 * // Result: { "page[limit]": string; "page[offset]": string; sort: string }
 */
export type FlattenToBracketNotation<T> = {
  [K in keyof T as K extends string
    ? T[K] extends Record<string, unknown>
      ? T[K] extends unknown[]
        ? K
        : `${K}[${Extract<keyof T[K], string>}]` | K
      : K
    : never]: T[K] extends Record<string, unknown>
    ? T[K] extends unknown[]
      ? string | string[] | undefined
      : string | string[] | undefined
    : string | string[] | undefined;
};
