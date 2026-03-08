/**
 * Type utilities for converting JSON:API QueryParams to Next.js searchParams format
 * with bracket notation support.
 */

/**
 * Next.js-only helper that flattens nested keys into bracket notation.
 * Kept local to avoid coupling shared query types to framework concerns.
 */
type FlattenToBracketNotation<T> = {
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

type NextFlatSearchParams = Record<string, string | string[] | undefined>;

/**
 * Generic type for Next.js searchParams that accepts generated QueryParams types.
 * Converts nested structures to bracket notation format used by Next.js URL search parameters.
 *
 * All values are converted to `string | string[] | undefined` per Next.js specification,
 * as URL search parameters are always strings.
 *
 * @template TQueryParams - Generated QueryParams type (e.g., GetTodosQueryParams)
 *
 * @example
 * import type { GetTodosQueryParams } from "@rvct/shared";
 *
 * type TodosParams = SearchParams<GetTodosQueryParams>;
 * // Accepts: { "page[limit]": "10", "page[offset]": "0", sort: "-created_at" }
 *
 * @example
 * // In a component
 * function MyComponent({ searchParams }: { searchParams: SearchParams<GetTodosQueryParams> }) {
 *   // searchParams is typed with bracket notation keys
 * }
 */
export type SearchParams<TQueryParams = Record<string, unknown>> =
  FlattenToBracketNotation<TQueryParams> & NextFlatSearchParams;

/**
 * Async version of SearchParams for Next.js 15+ server components.
 * Next.js 15 changed searchParams to be async (Promise-based) in server components.
 *
 * Use this type directly in your component props alongside Next.js built-in PageProps.
 *
 * @template TQueryParams - Generated QueryParams type (e.g., GetTodosQueryParams)
 *
 * @example
 * import type { GetTodosQueryParams } from "@rvct/shared";
 * import type { AsyncSearchParams } from "~/shared/types";
 *
 * // For components
 * export async function TodosList({
 *   searchParams
 * }: {
 *   searchParams: AsyncSearchParams<GetTodosQueryParams>
 * }) {
 *   const params = await searchParams;
 *   const query = parseQuery(getTodosQueryParamsSchema, params);
 * }
 *
 * @example
 * // For pages with Next.js built-in PageProps
 * export default async function Page(props: PageProps<'/'> & {
 *   searchParams: AsyncSearchParams<GetTodosQueryParams>
 * }) {
 *   const params = await props.params; // typed by Next.js
 *   const query = await props.searchParams; // typed by us
 * }
 */
export type AsyncSearchParams<TQueryParams = Record<string, unknown>> = Promise<
  SearchParams<TQueryParams>
>;
