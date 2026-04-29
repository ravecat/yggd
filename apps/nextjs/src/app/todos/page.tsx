import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentBoard } from "~/features/boards/query";
import { assigns } from "~/shared/lib/session";

function GuestPage() {
  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
        <div className="flex min-h-80 flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm font-medium text-foreground">Sign in to manage tasks.</p>
        </div>
      </div>
    </div>
  );
}

function TaskPageFallback() {
  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <div className="flex min-h-80 flex-1 items-center justify-center px-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto h-4 w-56 animate-pulse rounded bg-muted" />
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function TodosIndexContent() {
  const { userId } = await assigns();

  if (!userId) {
    return <GuestPage />;
  }

  const board = await fetchCurrentBoard();

  if (!board) {
    throw new Error("Authenticated user must always have a board");
  }

  redirect(`/todos/${board.id}`);
}

export default function TodosIndexPage() {
  return (
    <Suspense fallback={<TaskPageFallback />}>
      <TodosIndexContent />
    </Suspense>
  );
}
