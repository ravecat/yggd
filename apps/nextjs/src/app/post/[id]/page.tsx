import { PostView } from "@/components/post-view";
import Link from "next/link";
import { Suspense } from "react";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Back to posts
        </Link>

        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          }
        >
          <PostView id={id} />
        </Suspense>
      </div>
    </div>
  );
}
