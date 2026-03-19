import "server-only";

import {
  getTodos,
  getTodosId,
  getTodosQueryParamsSchema,
  type GetTodosQueryParamsSortEnumKey,
  isApiError,
  type GetTodosQueryParams,
  type MetaStatusesEnumKey,
  type Todo,
} from "@rvct/shared";
import { config } from "~/shared/lib/api";

export type Todos = {
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
};

type FetchTodosQuery = Omit<GetTodosQueryParams, "sort"> & {
  sort?: string | GetTodosQueryParamsSortEnumKey[];
};

export async function fetchTodos(
  boardId: string,
  query: FetchTodosQuery = {},
): Promise<Todos> {
  const sort =
    typeof query.sort === "string"
      ? query.sort
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : query.sort;

  const validatedQuery = getTodosQueryParamsSchema.parse({
    ...query,
    sort,
    filter: {
      ...query.filter,
      board_id: { eq: boardId },
    },
  });

  const response = await getTodos(validatedQuery, await config());

  return {
    statuses: response.meta?.statuses ?? [],
    todos: response.data ?? [],
  };
}

export async function fetchTodo(id: string): Promise<Todo | null> {
  try {
    const response = await getTodosId(id, undefined, await config());

    return response.data ?? null;
  } catch (error) {
    if (isApiError(error) && error.hasStatus(400, 403, 404, 422)) {
      return null;
    }

    throw error;
  }
}
