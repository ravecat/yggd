import { Suspense } from "react";
import { TodosList } from "./_components/todos-list";
import { TodosSkeleton } from "./_components/todos-skeleton";
import { ControlPanel } from "./_components/control-panel";
import { ControlPanelSkeleton } from "./_components/control-panel-skeleton";
import type { AsyncSearchParams } from "@/shared/types";
import { TODOS_CONFIG, type GetTodosQueryParams } from "@rvct/shared";

export default function Index({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetTodosQueryParams>;
}) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-4 px-4 py-4">
        <Suspense fallback={<ControlPanelSkeleton />}>
          <ControlPanel searchParams={searchParams} config={TODOS_CONFIG} />
        </Suspense>

        <Suspense fallback={<TodosSkeleton />}>
          <TodosList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
