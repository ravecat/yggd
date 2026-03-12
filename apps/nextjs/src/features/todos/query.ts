"use server";

import {
  getTodos,
  getTodosQueryParamsSchema,
  type MetaStatusesEnumKey,
  type Todo,
} from "@rvct/shared";
import type { GetTodosQueryParams } from "@rvct/shared";
import { config } from "~/shared/lib/api";

export type FetchTodosResult = {
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
};

export async function fetchTodos(
  boardId: string,
  query: GetTodosQueryParams = {},
): Promise<FetchTodosResult> {
  const validatedQuery = getTodosQueryParamsSchema.parse({
    ...query,
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
