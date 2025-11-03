import { Suspense } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PostsList } from "../components/posts-list";
import { PostsSkeleton } from "../components/posts-skeleton";
import { SortButtons } from "../components/sort-buttons";
import { SortButtonsSkeleton } from "../components/sort-buttons-skeleton";
import { Button } from "@/shared/ui/button";
import type { AsyncSearchParams } from "@/shared/types";
import type { GetPostsQueryParams } from "@yggd/shared";

export default function Index({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetPostsQueryParams>;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-8 max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl text-gray-900">Latest Posts</h1>
          <Link href="/post/create">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>

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
