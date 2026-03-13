"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isApiError,
  postTodos,
  type AttributesPriorityEnum2Key,
  type AttributesStatusEnum2Key,
} from "@rvct/shared";
import { config } from "~/shared/lib/api";
import { assigns } from "~/shared/lib/session";

export type CreateTodoState = {
  errors?: {
    board_id?: string[];
    title?: string[];
    content?: string[];
    priority?: string[];
    status?: string[];
    general?: string[];
  };
  message?: string;
};

const createTodoFields = [
  "title",
  "content",
  "priority",
  "status",
  "board_id",
] as const;

export async function createTodo(
  _prevState: CreateTodoState,
  formData: FormData,
): Promise<CreateTodoState> {
  const session = await assigns();

  if (!session.userId) {
    return { errors: { general: ["Not authenticated"] } };
  }

  const boardId = formData.get("boardId");

  if (typeof boardId !== "string" || boardId.length === 0) {
    return { errors: { general: ["Board is required"] } };
  }

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
      await config(),
    );
  } catch (error) {
    if (isApiError(error) && error.hasStatus(400, 422)) {
      return {
        errors: error.toFieldErrors(createTodoFields),
      };
    }

    return { errors: { general: ["Failed to create todo"] } };
  }

  const boardHref = `/todos/${boardId}`;

  revalidatePath(boardHref);
  redirect(boardHref);
}
