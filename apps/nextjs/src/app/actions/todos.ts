"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  postTodos,
  ValidationError,
  type AttributesPriorityEnum2Key,
  type AttributesStatusEnum2Key,
} from "@rvct/shared";
import { assigns } from "~/shared/lib/session";

export type CreateTodoState = {
  errors?: {
    title?: string[];
    content?: string[];
    priority?: string[];
    status?: string[];
    general?: string[];
  };
  message?: string;
};

export async function createTodo(
  _prevState: CreateTodoState,
  formData: FormData,
): Promise<CreateTodoState> {
  const session = await assigns();

  if (!session.userId) {
    return { errors: { general: ["Not authenticated"] } };
  }

  try {
    await postTodos({
      data: {
        type: "todo",
        attributes: {
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          priority: formData.get("priority") as AttributesPriorityEnum2Key,
          status: formData.get("status") as AttributesStatusEnum2Key,
          user_id: session.userId,
        },
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errors: error.traverseErrors([
          "title",
          "content",
          "priority",
          "status",
        ]),
      };
    }

    return { errors: { general: ["Failed to create todo"] } };
  }

  revalidatePath("/");
  redirect("/");
}
