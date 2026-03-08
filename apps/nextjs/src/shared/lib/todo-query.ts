import {
  createQuerySortPreset,
  getTodosQueryParamsSchema,
  type GetTodosQueryParams,
  type Todo,
} from "@rvct/shared";

type TodoSortField = keyof NonNullable<Todo["attributes"]>;
type TodoPage = NonNullable<GetTodosQueryParams["page"]>;

const SEARCH_FILTER_FIELD = "title" as const;
const SEARCH_FIELD_NAME = `filter[${SEARCH_FILTER_FIELD}][contains]` as const;

function compactFilter(filter?: GetTodosQueryParams["filter"]) {
  if (!filter) {
    return undefined;
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

function compactPage(page?: GetTodosQueryParams["page"]) {
  if (!page) {
    return undefined;
  }

  const nextPage = {
    after: page.after,
    before: page.before,
    count: page.count || undefined,
    limit: page.limit,
    offset: page.offset,
  } satisfies Partial<TodoPage>;

  return Object.values(nextPage).some((value) => value !== undefined)
    ? nextPage
    : undefined;
}

function normalizeSearchPage(page?: GetTodosQueryParams["page"]) {
  const normalizedPage = compactPage(page);

  if (!normalizedPage) {
    return undefined;
  }

  const nextPage = {
    count: normalizedPage.count,
    limit: normalizedPage.limit,
  } satisfies Partial<TodoPage>;

  return Object.values(nextPage).some((value) => value !== undefined)
    ? nextPage
    : undefined;
}

function normalizeQuery(query: GetTodosQueryParams): GetTodosQueryParams {
  return {
    ...query,
    filter: compactFilter(query.filter),
    page: compactPage(query.page),
  };
}

function buildSearchBaseQuery(query: GetTodosQueryParams): GetTodosQueryParams {
  const normalizedQuery = normalizeQuery(query);
  const { [SEARCH_FILTER_FIELD]: _search, ...filter } =
    normalizedQuery.filter ?? {};

  return {
    ...normalizedQuery,
    filter: compactFilter(filter),
    page: normalizeSearchPage(normalizedQuery.page),
  };
}

export const todoQuery = {
  schema: getTodosQueryParamsSchema,
  normalize: normalizeQuery,
  sort: createQuerySortPreset<GetTodosQueryParams, TodoSortField>({
    fields: [
      { field: "title" },
      { field: "priority" },
      { field: "updated_at" },
    ],
  }),
  search: {
    fieldName: SEARCH_FIELD_NAME,
    getValue: (query: GetTodosQueryParams) =>
      query.filter?.[SEARCH_FILTER_FIELD]?.contains?.trim() ?? "",
    build: (query: GetTodosQueryParams, value: string): GetTodosQueryParams => {
      const normalizedValue = value.trim();
      const baseQuery = buildSearchBaseQuery(query);

      if (normalizedValue.length === 0) {
        return baseQuery;
      }

      return {
        ...baseQuery,
        filter: {
          ...(baseQuery.filter ?? {}),
          [SEARCH_FILTER_FIELD]: {
            contains: normalizedValue,
          },
        },
      };
    },
  },
};
