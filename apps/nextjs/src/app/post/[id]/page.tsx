import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsId } from "@rvct/shared";

export function PostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await getPostsId(id);
  const post = response.data;

  if (!post) {
    notFound();
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-6">
        {post.attributes?.title || "Untitled"}
      </h1>

      {post.attributes?.created_at && (
        <time className="text-sm text-gray-600 mb-8 block">
          {new Date(post.attributes.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}

      <div className="mt-8 text-gray-800 whitespace-pre-wrap leading-relaxed">
        {post.attributes?.content}
      </div>
    </>
  );
}

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
      >
        ← Back to posts
      </Link>

      <Suspense fallback={<PostSkeleton />}>
        <Post params={params} />
      </Suspense>
    </div>
  );
}
