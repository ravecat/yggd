import {
  deserializeQueryParams as sharedDeserialize,
  serializeQueryParams as sharedSerialize,
} from "@yggd/shared";
import type { SearchParams } from "../types/query";

/**
 * Deserializes Next.js searchParams with bracket notation into a nested object structure.
 * 
 * This is a Next.js-specific wrapper around the shared deserializeQueryParams function.
 * It handles the SearchParams type from Next.js and delegates to the generic implementation.
 * 
 * @template TQueryParams - Generated QueryParams type (e.g., GetPostsQueryParams)
 * @param params - Flat object with bracket notation keys from Next.js searchParams
 * @returns Deserialized nested object structure matching TQueryParams (all fields optional)
 * 
 * @example
 * import type { GetPostsQueryParams } from "@yggd/shared";
 * 
 * const params = await searchParams;
 * const parsed = deserializeQueryParams<GetPostsQueryParams>(params);
 * // parsed.page is typed as { limit?: number; offset?: number; ... } | undefined
 * // parsed.sort is typed as string | undefined
 */
export function deserializeQueryParams<TQueryParams = Record<string, unknown>>(
  params: SearchParams<TQueryParams>
): Partial<TQueryParams> {
  return sharedDeserialize<TQueryParams>(params);
}

/**
 * Serializes a nested object structure into a flat array of key-value pairs
 * with bracket notation, ready for URLSearchParams in Next.js.
 * 
 * This is a Next.js-specific wrapper around the shared serializeQueryParams function.
 * 
 * @template TQueryParams - Query params type (e.g., GetPostsQueryParams)
 * @param params - Nested object structure to serialize
 * @returns Array of [key, value] tuples for URLSearchParams
 * 
 * @example
 * const params = serializeQueryParams({
 *   page: { limit: 10, offset: 0 },
 *   sort: "title"
 * });
 * // Returns: [["page[limit]", "10"], ["page[offset]", "0"], ["sort", "title"]]
 * 
 * const url = `/?${new URLSearchParams(params).toString()}`;
 * // Results in: /?page[limit]=10&page[offset]=0&sort=title
 */
export function serializeQueryParams<TQueryParams = Record<string, unknown>>(
  params: Partial<TQueryParams>
): [string, string][] {
  return sharedSerialize<TQueryParams>(params);
}
