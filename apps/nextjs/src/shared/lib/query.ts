import type { SearchParams } from "../types/query";

/**
 * Parses a flat object with bracket notation keys into a nested object structure.
 * 
 * This function converts Next.js searchParams (with bracket notation) back into
 * the original nested structure expected by the API, with type safety.
 * 
 * Supports:
 * - Simple keys: { sort: "value" } → { sort: "value" }
 * - Nested keys: { "page[limit]": "10" } → { page: { limit: 10 } }
 * - Deep nesting: { "filter[title][contains]": "test" } → { filter: { title: { contains: "test" } } }
 * - Numeric conversion: { "page[limit]": "10" } → { page: { limit: 10 } }
 * - Arrays: { "tags[]": ["a", "b"] } → { tags: ["a", "b"] }
 * 
 * @template TQueryParams - Generated QueryParams type (e.g., GetPostsQueryParams)
 * @param params - Flat object with bracket notation keys from Next.js searchParams
 * @returns Parsed nested object structure matching TQueryParams (all fields optional)
 * 
 * @example
 * import type { GetPostsQueryParams } from "@yggd/shared";
 * 
 * const params = await searchParams;
 * const parsed = parseQueryParams<GetPostsQueryParams>(params);
 * // parsed.page is typed as { limit?: number; offset?: number; ... } | undefined
 * // parsed.sort is typed as string | undefined
 */
export function parseQueryParams<TQueryParams = Record<string, unknown>>(
  params: SearchParams<TQueryParams>
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
 * Automatically converts numeric strings to numbers.
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
  // Check for boolean
  if (value === "true") return true;
  if (value === "false") return false;

  // Check for number
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== "") {
    return num;
  }

  return value;
}
