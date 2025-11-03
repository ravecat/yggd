"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { PostView } from "@/components/post-view";
import { Suspense } from "react";

export default function PostModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Post Details</DialogTitle>
        </DialogHeader>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          }
        >
          <PostModalContent params={params} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

async function PostModalContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostView id={id} />;
}
