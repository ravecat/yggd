import type { FlatQueryParams, QueryParams } from '../types/query.js';

/**
 * Deserializes a flat object with bracket notation keys into a nested object structure.
 * 
 * This function converts flat query parameters (with bracket notation) back into
 * the original nested structure, with automatic type conversion.
 * 
 * Supports:
 * - Simple keys: { sort: "value" } → { sort: "value" }
 * - Nested keys: { "page[limit]": "10" } → { page: { limit: 10 } }
 * - Deep nesting: { "filter[title][contains]": "test" } → { filter: { title: { contains: "test" } } }
 * - Numeric conversion: { "page[limit]": "10" } → { page: { limit: 10 } }
 * - Boolean conversion: { "active": "true" } → { active: true }
 * - Arrays: { "tags[]": ["a", "b"] } → { tags: ["a", "b"] }
 * 
 * @template TQueryParams - Target type for the deserialized query parameters
 * @param params - Flat object with bracket notation keys (typically from URL query params)
 * @returns Deserialized nested object structure matching TQueryParams (all fields optional)
 * 
 * @example
 * const flatParams = { "page[limit]": "10", sort: "-created_at" };
 * const parsed = deserializeQueryParams(flatParams);
 * // Result: { page: { limit: 10 }, sort: "-created_at" }
 * 
 * @example
 * type QueryParams = { page: { limit: number }; sort: string };
 * const parsed = deserializeQueryParams<QueryParams>(flatParams);
 * // Typed result with proper type inference
 */
export function deserializeQueryParams<TQueryParams = QueryParams>(
  params: FlatQueryParams
): Partial<TQueryParams> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    const keys = parseKey(key);
    setNestedValue(result, keys, value);
  }

  return result as Partial<TQueryParams>;
}

/**
 * Parses a key with bracket notation into an array of nested keys.
 * 
 * @example
 * parseKey("page[number]") // ["page", "number"]
 * parseKey("filter[title][contains]") // ["filter", "title", "contains"]
 * parseKey("tags[]") // ["tags"]
 */
function parseKey(key: string): string[] {
  const keys: string[] = [];
  let current = "";

  for (let i = 0; i < key.length; i++) {
    const char = key[i];

    if (char === "[") {
      if (current) {
        keys.push(current);
        current = "";
      }
    } else if (char === "]") {
      if (current) {
        keys.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    keys.push(current);
  }

  return keys;
}

/**
 * Sets a value in a nested object structure based on an array of keys.
 * Automatically converts numeric strings to numbers and boolean strings to booleans.
 * 
 * @param obj - Target object to modify
 * @param keys - Array of keys representing the path
 * @param value - Value to set (string, array of strings, or undefined)
 */
function setNestedValue(
  obj: Record<string, unknown>,
  keys: string[],
  value: string | string[] | undefined
): void {
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!(key in current)) {
      current[key] = {};
    }

    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }

    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = convertValue(value);
}

/**
 * Converts string values to appropriate types.
 * - Numeric strings → numbers
 * - "true"/"false" → booleans
 * - Arrays of strings → arrays with converted values
 * - Other strings → unchanged
 * 
 * @param value - Value to convert
 * @returns Converted value
 */
function convertValue(
  value: string | string[] | undefined
): string | number | boolean | (string | number | boolean)[] | undefined {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    return value.map((v) => convertSingleValue(v));
  }

  return convertSingleValue(value);
}

/**
 * Converts a single string value to an appropriate type.
 */
function convertSingleValue(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;

  const num = Number(value);
  if (!isNaN(num) && value.trim() !== "") {
    return num;
  }

  return value;
}

/**
 * Serializes a nested object structure into a flat array of key-value pairs
 * with bracket notation, ready for URLSearchParams or other flat representations.
 * 
 * This is the inverse of deserializeQueryParams - converts typed query objects
 * back into the flat format needed for URL construction or API requests.
 * 
 * Supports:
 * - Simple keys: { sort: "value" } → [["sort", "value"]]
 * - Nested objects: { page: { limit: 10 } } → [["page[limit]", "10"]]
 * - Deep nesting: { filter: { title: { contains: "test" } } } → [["filter[title][contains]", "test"]]
 * - Arrays: { tags: ["a", "b"] } → [["tags[]", "a"], ["tags[]", "b"]]
 * - Skips undefined/null values
 * 
 * @template TQueryParams - Query params type
 * @param params - Nested object structure to serialize
 * @returns Array of [key, value] tuples for URLSearchParams or other consumers
 * 
 * @example
 * const params = serializeQueryParams({
 *   page: { limit: 10, offset: 0 },
 *   sort: "title"
 * });
 * // Returns: [["page[limit]", "10"], ["page[offset]", "0"], ["sort", "title"]]
 * 
 * const searchParams = new URLSearchParams(params);
 * const url = `/?${searchParams.toString()}`;
 * // Results in: /?page[limit]=10&page[offset]=0&sort=title
 */
export function serializeQueryParams<TQueryParams = QueryParams>(
  params: Partial<TQueryParams>
): [string, string][] {
  const result: [string, string][] = [];

  function serialize(obj: unknown, prefix = ""): void {
    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((value) => {
        if (value !== null && value !== undefined) {
          result.push([`${prefix}[]`, String(value)]);
        }
      });
      return;
    }

    if (typeof obj === "object") {
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}[${key}]` : key;
        serialize(value, newKey);
      });
      return;
    }

    result.push([prefix, String(obj)]);
  }

  serialize(params);
  return result;
}
