import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ControlPanel,
  ControlPanelSkeleton,
} from "./_components/control-panel";
import { TodosList, TodosSkeleton } from "./_components/todos-list";
import { fetchBoard } from "~/features/boards/query";

export type BoardPageProps = PageProps<"/todos/[boardId]">;

function BoardPageFallback() {
  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <ControlPanelSkeleton />
        <TodosSkeleton />
      </div>
    </div>
  );
}

async function BoardPageContent({
  params,
  searchParams,
}: {
  params: BoardPageProps["params"];
  searchParams: BoardPageProps["searchParams"];
}) {
  const { boardId } = await params;
  const board = await fetchBoard(boardId);

  if (!board) {
    notFound();
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
        <ControlPanel boardId={board.id} />
        <Suspense fallback={<TodosSkeleton />}>
          <TodosList boardId={board.id} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

export default function BoardPage(props: BoardPageProps) {
  return (
    <Suspense fallback={<BoardPageFallback />}>
      <BoardPageContent {...props} />
    </Suspense>
  );
}
