"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createPost } from "@/app/actions/posts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

export default function CreatePostModal() {
  const router = useRouter();
  const [state, submit, pending] = useActionState(createPost, {
    errors: {},
    message: "",
  });

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <form action={submit} className="space-y-4">
          {state.errors?.general && state.errors.general.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {state.errors.general.join(", ")}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={pending}
              placeholder="Enter post title"
              aria-describedby={state.errors?.title ? "title-error" : undefined}
            />
            {state.errors?.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600">
                {state.errors.title.join(", ")}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={pending}
              placeholder="Write your post content..."
              aria-describedby={
                state.errors?.content ? "content-error" : undefined
              }
            />
            {state.errors?.content && (
              <p id="content-error" className="mt-1 text-sm text-red-600">
                {state.errors.content.join(", ")}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
