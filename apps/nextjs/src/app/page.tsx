import { Suspense } from "react";
import { PostsList } from "../components/posts-list";
import { PostsSkeleton } from "../components/posts-skeleton";
import { SortButtons } from "../components/sort-buttons";
import { SortButtonsSkeleton } from "../components/sort-buttons-skeleton";

type PageSearchParams = {
  "page[number]"?: string;
  "page[size]"?: string;
  sort?: string;
};

export default function Index({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <h1 className="text-2xl mb-8 text-gray-900">Latest Posts</h1>

        <Suspense fallback={<SortButtonsSkeleton />}>
          <SortButtons searchParams={searchParams} />
        </Suspense>

        <Suspense fallback={<PostsSkeleton />}>
          <PostsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
