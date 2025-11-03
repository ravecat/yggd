"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { postPosts, ValidationError } from "@yggd/shared";

export type CreatePostState = {
  errors?: {
    title?: string[];
    content?: string[];
    general?: string[];
  };
  message?: string;
};

export async function createPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  try {
    await postPosts({
      data: {
        type: "post",
        attributes: {
          title,
          content,
          author_id: "",
        },
      },
    });

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        errors: error.traverseErrors(['title', 'content']),
      };
    }

    return {
      errors: {
        general: [
          error instanceof Error ? error.message : "Failed to create post",
        ],
      },
    };
  }
}
