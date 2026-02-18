import { Suspense } from "react";
import { TodosList } from "./_components/todos-list";
import { TodosSkeleton } from "./_components/todos-skeleton";
import { ControlPanel } from "./_components/control-panel";
import { ControlPanelSkeleton } from "./_components/control-panel-skeleton";
import type { AsyncSearchParams } from "~/shared/types";
import { deserializeQueryParams, type GetTodosQueryParams } from "@rvct/shared";

export default async function Index({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetTodosQueryParams>;
}) {
  const params = await searchParams;
  const query = deserializeQueryParams<GetTodosQueryParams>(params);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <Suspense fallback={<ControlPanelSkeleton />}>
          <ControlPanel query={query} />
        </Suspense>

        <Suspense fallback={<TodosSkeleton />}>
          <TodosList query={query} />
        </Suspense>
      </div>
    </div>
  );
}
