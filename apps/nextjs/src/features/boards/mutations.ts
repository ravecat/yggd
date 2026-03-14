"use server";

import { revalidatePath } from "next/cache";
import {
  type ErrorMap,
  patchBoardsId,
  isApiError,
  type AttributesVisibilityEnum2Key,
} from "@rvct/shared";
import { config } from "~/shared/lib/api";
import { assigns } from "~/shared/lib/session";

export type UpdateBoardVisibilityResult = {
  errors?: ErrorMap;
  visibility?: AttributesVisibilityEnum2Key;
};

export async function updateBoardVisibility(
  boardId: string,
  visibility: AttributesVisibilityEnum2Key,
): Promise<UpdateBoardVisibilityResult> {
  const [session, requestConfig] = await Promise.all([assigns(), config()]);

  if (!session.userId) {
    return { errors: { general: ["Not authenticated"] } };
  }

  try {
    await patchBoardsId(
      boardId,
      {
        data: {
          id: boardId,
          type: "board",
          attributes: {
            visibility,
          },
        },
      },
      undefined,
      requestConfig,
    );
  } catch (error) {
    if (isApiError(error)) {
      return { errors: error.errors };
    }

    return { errors: { general: ["Failed to update board visibility"] } };
  }

  revalidatePath(`/todos/${boardId}`);

  return { visibility };
}
