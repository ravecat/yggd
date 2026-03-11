"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getTodos,
  getTodosQueryParamsSchema,
  postTodos,
  ValidationError,
  type AttributesPriorityEnum2Key,
  type AttributesStatusEnum2Key,
  type MetaStatusesEnumKey,
  type Todo,
} from "@rvct/shared";
import type { GetTodosQueryParams } from "@rvct/shared";
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

export type FetchTodosResult = {
  statuses: MetaStatusesEnumKey[];
  todos: Todo[];
};

export async function fetchTodosAction(
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
