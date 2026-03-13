import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentBoard } from "~/features/boards/query";

type CreateTodoPageProps = {
  searchParams: Promise<{ boardId?: string }>;
};

async function CreateTodoPageContent({ searchParams }: CreateTodoPageProps) {
  const { boardId } = await searchParams;

  if (typeof boardId === "string" && boardId.length > 0) {
    redirect(`/todos/${boardId}`);
  }

  const board = await fetchCurrentBoard();

  if (!board) {
    redirect("/");
  }

  redirect(`/todos/${board.id}`);

  return null;
}

export default function CreateTodoPage(props: CreateTodoPageProps) {
  return (
    <Suspense fallback={null}>
      <CreateTodoPageContent {...props} />
    </Suspense>
  );
}
