import { Suspense } from "react";
import { type GetTodosQueryParams } from "@rvct/shared";
import { TodosList } from "./_components/todos-list";
import { TodosSkeleton } from "./_components/todos-skeleton";
import { ControlPanel } from "./_components/control-panel";
import { ControlPanelSkeleton } from "./_components/control-panel-skeleton";
import { parseQuery } from "~/shared/lib/query";
import { todoQuery } from "~/shared/lib/todo-query";
import type { AsyncSearchParams } from "~/shared/types";

export default async function Index({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetTodosQueryParams>;
}) {
  const params = await searchParams;
  const query = parseQuery(todoQuery.schema, params);

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
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
