import { Suspense } from "react";
import { PostsList } from "../components/posts-list";
import { PostsSkeleton } from "../components/posts-skeleton";
import { ControlPanel } from "../components/control-panel";
import { ControlPanelSkeleton } from "../components/control-panel-skeleton";
import { SignIn } from "../components/sign-in";
import { ExcalidrawCanvas } from "../components/excalidraw-canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { AsyncSearchParams } from "@/shared/types";
import { POSTS_CONFIG, type GetPostsQueryParams } from "@yggd/shared";

export default function Index({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetPostsQueryParams>;
}) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="p-4 pb-0">
        <div className="flex justify-end items-center">
          <Suspense
            fallback={
              <div className="h-10 w-40 animate-pulse bg-gray-200 rounded-md" />
            }
          >
            <SignIn />
          </Suspense>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-4 pt-0 flex flex-col min-h-0 overflow-auto">
          <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0 gap-4">
            <Suspense fallback={<ControlPanelSkeleton />}>
              <ControlPanel searchParams={searchParams} config={POSTS_CONFIG} />
            </Suspense>

            <Suspense fallback={<PostsSkeleton />}>
              <PostsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        <div className="flex-1 p-4 pt-0 flex flex-col min-h-0">
          <Tabs
            defaultValue="drawboard"
            className="flex-1 flex flex-col min-h-0 gap-4"
          >
            <TabsList>
              <TabsTrigger value="drawboard">Drawboard</TabsTrigger>
            </TabsList>
            <TabsContent value="drawboard" className="flex-1 min-h-0">
              <ExcalidrawCanvas />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
