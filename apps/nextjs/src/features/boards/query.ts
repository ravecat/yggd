import "server-only";

import {
  getBoards,
  getBoardsId,
  getBoardsQueryParamsSchema,
  isApiError,
  type Board,
} from "@rvct/shared";
import { config } from "~/shared/lib/api";
import { assigns } from "~/shared/lib/session";

export async function fetchCurrentBoard(): Promise<Board | null> {
  const { userId } = await assigns();

  if (!userId) {
    return null;
  }

  const query = getBoardsQueryParamsSchema.parse({
    page: {
      limit: 1,
    },
  });

  const response = await getBoards(query, await config());

  return response.data?.[0] ?? null;
}

export async function fetchBoard(boardId: string): Promise<Board | null> {
  try {
    const response = await getBoardsId(boardId, undefined, await config());

    return response.data ?? null;
  } catch (error) {
    if (isApiError(error) && error.hasStatus(400, 403, 404, 422)) {
      return null;
    }

    throw error;
  }
}
