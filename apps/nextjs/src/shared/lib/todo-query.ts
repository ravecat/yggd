import {
  createQuerySortPreset,
  getTodosQueryParamsSchema,
  type GetTodosQueryParams,
  type Todo,
} from "@rvct/shared";

type TodoSortField = keyof NonNullable<Todo["attributes"]>;

export const todoQuery = {
  schema: getTodosQueryParamsSchema,
  sort: createQuerySortPreset<GetTodosQueryParams, TodoSortField>({
    fields: [
      { field: "title" },
      { field: "priority" },
      { field: "updated_at" },
    ],
  }),
};
