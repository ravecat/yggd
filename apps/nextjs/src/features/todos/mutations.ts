"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  type ErrorMap,
  isApiError,
  postTodos,
  type AttributesPriorityEnum2Key,
  type AttributesStatusEnum2Key,
} from "@rvct/shared";
import { config } from "~/shared/lib/api";
import { assigns } from "~/shared/lib/session";

export type CreateTodoState = {
  errors?: ErrorMap;
  message?: string;
};

export async function createTodo(
  _prevState: CreateTodoState,
  formData: FormData,
): Promise<CreateTodoState> {
  const [session, requestConfig] = await Promise.all([assigns(), config()]);

  if (!session.userId) {
    return { errors: { general: ["Not authenticated"] } };
  }

  const boardId = formData.get("boardId") as string;

  try {
    await postTodos(
      {
        data: {
          type: "todo",
          attributes: {
            title: formData.get("title") as string,
            content: formData.get("content") as string,
            priority: formData.get("priority") as AttributesPriorityEnum2Key,
            status: formData.get("status") as AttributesStatusEnum2Key,
            board_id: boardId,
          },
        },
      },
      undefined,
      requestConfig,
    );
  } catch (error) {
    if (isApiError(error)) {
      return {
        errors: error.errors,
      };
    }

    return { errors: { general: ["Failed to create todo"] } };
  }

  const boardHref = `/todos/${boardId}`;

  revalidatePath(boardHref);
  redirect(boardHref);
}
