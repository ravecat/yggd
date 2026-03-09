import "server-only";

import {
  getTodos,
  getTodosQueryParamsSchema,
  type GetTodosQueryParams,
  type MetaStatusesEnumKey,
  type Todo,
} from "@rvct/shared";
import { assigns } from "./session";

export type FetchTodosResult = {
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
};

export async function fetchTodos(
  query: GetTodosQueryParams = {},
): Promise<FetchTodosResult> {
  const validatedQuery = getTodosQueryParamsSchema.parse(query);

  const response = await getTodos(validatedQuery);

  return {
    statuses: response.meta?.statuses ?? [],
    todos: response.data ?? [],
  };
}

export async function fetchCurrentUserTodos(
  query: GetTodosQueryParams = {},
): Promise<FetchTodosResult> {
  const { userId } = await assigns();

  if (!userId) {
    throw new Error("Authentication required to view todos");
  }

  return fetchTodos({
    ...query,
    filter: {
      ...query.filter,
      user_id: { eq: userId },
    },
  });
}
