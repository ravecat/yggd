import type { FlattenToBracketNotation } from "@rvct/shared";

/**
 * Type utilities for converting JSON:API QueryParams to Next.js searchParams format
 * with bracket notation support.
 */

/**
 * Generic type for Next.js searchParams that accepts generated QueryParams types.
 * Converts nested structures to bracket notation format used by Next.js URL search parameters.
 * 
 * All values are converted to `string | string[] | undefined` per Next.js specification,
 * as URL search parameters are always strings.
 * 
 * @template TQueryParams - Generated QueryParams type (e.g., GetPostsQueryParams)
 * 
 * @example
 * import type { GetPostsQueryParams } from "@rvct/shared";
 * 
 * type PostsParams = SearchParams<GetPostsQueryParams>;
 * // Accepts: { "page[limit]": "10", "page[offset]": "0", sort: "-created_at" }
 * 
 * @example
 * // In a component
 * function MyComponent({ searchParams }: { searchParams: SearchParams<GetPostsQueryParams> }) {
 *   // searchParams is typed with bracket notation keys
 * }
 */
export type SearchParams<TQueryParams = Record<string, unknown>> =
  FlattenToBracketNotation<TQueryParams> & {
    [key: string]: string | string[] | undefined;
  };

/**
 * Async version of SearchParams for Next.js 15+ server components.
 * Next.js 15 changed searchParams to be async (Promise-based) in server components.
 * 
 * Use this type directly in your component props alongside Next.js built-in PageProps.
 * 
 * @template TQueryParams - Generated QueryParams type (e.g., GetPostsQueryParams)
 * 
 * @example
 * import type { GetPostsQueryParams } from "@rvct/shared";
 * import type { AsyncSearchParams } from "@/shared/types";
 * 
 * // For components
 * export async function PostsList({ 
 *   searchParams 
 * }: { 
 *   searchParams: AsyncSearchParams<GetPostsQueryParams> 
 * }) {
 *   const params = await searchParams;
 *   const parsed = deserializeQueryParams<GetPostsQueryParams>(params);
 * }
 * 
 * @example
 * // For pages with Next.js built-in PageProps
 * export default async function Page(props: PageProps<'/'> & {
 *   searchParams: AsyncSearchParams<GetPostsQueryParams>
 * }) {
 *   const params = await props.params; // typed by Next.js
 *   const query = await props.searchParams; // typed by us
 * }
 */
export type AsyncSearchParams<TQueryParams = Record<string, unknown>> = Promise<
  SearchParams<TQueryParams>
>;
