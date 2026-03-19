import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { BoardVisibilityToggle } from "./_components/board-visibility-toggle";
import { TodosFilterInput } from "./_components/todos-filter-input";
import { TodosList, TodosListSkeleton } from "./_components/todos-list";
import { TodosSortMenu } from "./_components/todos-sort-menu";
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
    sort?: string | string[];
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
  const sort = ([] as string[])
    .concat(currentSearchParams.sort ?? [])
    .join(",");

  const [{ userId }, data] = await Promise.all([
    assigns(),
    fetchTodos(board.id, {
      filter: {
        title: { contains: filter },
      },
      sort,
    }),
  ]);

  const isOwner = board.attributes?.owner_id === userId;
  const visibility = board.attributes?.visibility;

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
        {isOwner ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/todo/create?boardId=${encodeURIComponent(board.id)}`}
              className="w-full shrink-0 sm:w-auto"
            >
              <Button size="sm" className="w-full min-w-31 sm:w-auto">
                <PlusIcon className="h-4 w-4" />
                Create task
              </Button>
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <TodosFilterInput key={filter} value={filter} />
              </div>
              <TodosSortMenu value={sort} />
            </div>
            <BoardVisibilityToggle id={board.id} visibility={visibility} />
          </div>
        ) : null}
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
