"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { postTodos } from "@rvct/shared";
import { assigns } from "@/shared/lib/session";

export type CreateTodoState = {
  errors?: {
    title?: string[];
    content?: string[];
    general?: string[];
  };
  message?: string;
};

export async function createTodo(
  _prevState: CreateTodoState,
  formData: FormData,
): Promise<CreateTodoState> {
  const session = await assigns();

  await postTodos({
    data: {
      type: "todo",
      attributes: {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        user_id: session.userId!,
      },
    },
  });

  revalidatePath("/");
  redirect("/");
}
