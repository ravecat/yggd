import { Suspense } from "react";
import { PostsList } from "../components/posts-list";
import { PostsSkeleton } from "../components/posts-skeleton";

export default async function Index({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <h1 className="text-2xl mb-8 text-gray-900">Latest Posts</h1>

        <Suspense fallback={<PostsSkeleton />}>
          <PostsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
