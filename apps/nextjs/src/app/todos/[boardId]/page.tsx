import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { BoardVisibilityToggle } from "./_components/board-visibility-toggle";
import { TodosList, TodosListSkeleton } from "./_components/todos-list";
import { fetchBoard } from "~/features/boards/query";
import { fetchTodos } from "~/features/todos/query";
import { assigns } from "~/shared/lib/session";
import { Button } from "~/shared/ui/button";

export type BoardPageProps = PageProps<"/todos/[boardId]">;

function BoardPageFallback() {
  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <TodosListSkeleton />
      </div>
    </div>
  );
}

async function BoardPageContent({
  params,
}: {
  params: BoardPageProps["params"];
}) {
  const { boardId } = await params;
  const board = await fetchBoard(boardId);

  if (!board) {
    notFound();
  }

  const [{ userId }, initialData] = await Promise.all([
    assigns(),
    fetchTodos(board.id),
  ]);

  const isOwner = board.attributes?.owner_id === userId;

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
        <TodosList boardId={board.id} initialData={initialData}>
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

          {isOwner && board.attributes?.visibility ? (
            <BoardVisibilityToggle
              id={board.id}
              visibility={board.attributes.visibility}
            />
          ) : null}
        </TodosList>
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
