import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { BoardVisibilityToggle } from "./_components/board-visibility-toggle";
import { TodosFilterInput } from "./_components/todos-filter-input";
import { TodosList, TodosListSkeleton } from "./_components/todos-list";
import { fetchBoard } from "~/features/boards/query";
import { fetchTodos } from "~/features/todos/query";
import { assigns } from "~/shared/lib/session";
import { Button } from "~/shared/ui/button";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
  searchParams: Promise<{
    filter?: string | string[];
  }>;
};

function BoardPageFallback() {
  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <TodosListSkeleton />
      </div>
    </div>
  );
}

async function BoardPageContent({ params, searchParams }: BoardPageProps) {
  const [{ boardId }, currentSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const board = await fetchBoard(boardId);

  if (!board) {
    notFound();
  }

  const filter =
    typeof currentSearchParams.filter === "string"
      ? currentSearchParams.filter
      : "";

  const [{ userId }, data] = await Promise.all([
    assigns(),
    fetchTodos(
      board.id,
      filter
        ? {
            filter: {
              title: { contains: filter },
            },
          }
        : {},
    ),
  ]);

  const isOwner = board.attributes?.owner_id === userId;

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <Link
              href={`/todo/create?boardId=${encodeURIComponent(board.id)}`}
              className="w-full shrink-0 sm:w-auto"
            >
              <Button size="sm" className="w-full min-w-31 sm:w-auto">
                <PlusIcon className="h-4 w-4" />
                Create task
              </Button>
            </Link>
          ) : null}
          <div className="min-w-0 flex-1">
            <TodosFilterInput key={filter} value={filter} />
          </div>
          {isOwner && board.attributes?.visibility ? (
            <BoardVisibilityToggle
              id={board.id}
              visibility={board.attributes.visibility}
            />
          ) : null}
        </div>
        <TodosList data={data} />
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
