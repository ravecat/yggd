"use server";

import {
  getTodos,
  getTodosQueryParamsSchema,
  type MetaStatusesEnumKey,
  type Todo,
} from "@rvct/shared";
import type { GetTodosQueryParams } from "@rvct/shared";
import { assigns } from "~/shared/lib/session";

export type FetchTodosResult = {
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
};

export async function fetchTodos(
  query: GetTodosQueryParams = {},
): Promise<FetchTodosResult> {
  const { userId } = await assigns();

  if (!userId) {
    throw new Error("Authentication required to view todos");
  }

  const validatedQuery = getTodosQueryParamsSchema.parse({
    ...query,
    filter: {
      ...query.filter,
      user_id: { eq: userId },
    },
  });

  const response = await getTodos(validatedQuery);

  return {
    statuses: response.meta?.statuses ?? [],
    todos: response.data ?? [],
  };
}
