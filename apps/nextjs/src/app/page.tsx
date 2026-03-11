import { Suspense } from "react";
import { ControlPanel } from "./_components/control-panel";
import { ControlPanelSkeleton } from "./_components/control-panel-skeleton";
import { TodosList } from "./_components/todos-list";
import { TodosSkeleton } from "./_components/todos-skeleton";
import { TodosProvider } from "~/contexts/todos";
import { assigns } from "~/shared/lib/session";
import { fetchCurrentUserTodos } from "~/shared/lib/todos";

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

async function IndexPageContent() {
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

  const { statuses, todos } = await fetchCurrentUserTodos();

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">{boardDescription}</p>
        <TodosProvider statuses={statuses} todos={todos}>
          <ControlPanel canCreate />
          <TodosList />
        </TodosProvider>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <Suspense fallback={<IndexPageFallback />}>
      <IndexPageContent />
    </Suspense>
  );
}
