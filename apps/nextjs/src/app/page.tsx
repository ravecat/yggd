import { Suspense } from "react";
import {
  ControlPanel,
  ControlPanelSkeleton,
} from "./_components/control-panel";
import { TodosList, TodosSkeleton } from "./_components/todos-list";
import { assigns } from "~/shared/lib/session";

const boardDescription =
  "Dynamic board grouped by status for daily task tracking (JSON:API)";

function IndexPageFallback() {
  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">{boardDescription}</p>
        <ControlPanelSkeleton />
        <TodosSkeleton />
      </div>
    </div>
  );
}

type IndexPageProps = PageProps<"/">;

async function IndexPageContent({
  searchParams,
}: {
  searchParams: IndexPageProps["searchParams"];
}) {
  const { userId } = await assigns();

  if (!userId) {
    return (
      <div className="h-full overflow-hidden">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
          <p className="py-2 text-sm text-muted-foreground">
            {boardDescription}
          </p>
          <div className="flex min-h-80 flex-1 items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-foreground">
              Sign in to manage tasks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">{boardDescription}</p>
        <ControlPanel />
        <Suspense fallback={<TodosSkeleton />}>
          <TodosList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

export default function Index({ searchParams }: IndexPageProps) {
  return (
    <Suspense fallback={<IndexPageFallback />}>
      <IndexPageContent searchParams={searchParams} />
    </Suspense>
  );
}
