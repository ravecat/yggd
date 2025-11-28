"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { postPosts } from "@rvct/shared";
import { assigns } from "@/shared/lib/session";

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
  const session = await assigns();

  await postPosts({
    data: {
      type: "post",
      attributes: {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        author_id: session.userId!,
      },
    },
  });

  revalidatePath("/");
  redirect("/");
}
