/**
 * Type representing Next.js searchParams structure
 */
export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Parses a flat object with bracket notation keys into a nested object structure.
 * 
 * Supports:
 * - Simple keys: { sort: "value" } → { sort: "value" }
 * - Nested keys: { "page[number]": "1" } → { page: { number: 1 } }
 * - Deep nesting: { "filter[title][contains]": "test" } → { filter: { title: { contains: "test" } } }
 * - Numeric conversion: { "page[number]": "5" } → { page: { number: 5 } }
 * - Arrays: { "tags[]": ["a", "b"] } → { tags: ["a", "b"] }
 * 
 * @param params - Flat object with bracket notation keys
 * @returns Nested object with parsed structure
 * 
 * @example
 * parseQueryParams({ "page[number]": "1", "page[size]": "10", "sort": "-created_at" })
 * // Returns: { page: { number: 1, size: 10 }, sort: "-created_at" }
 */
export function parseQueryParams<T = Record<string, unknown>>(
  params: SearchParams
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    const keys = parseKey(key);
    setNestedValue(result, keys, value);
  }

  return result as T;
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
