import { Suspense } from "react";
import { TodoView } from "./_components/todo-view";
import { TodoViewSkeleton } from "./_components/todo-view-skeleton";

export default async function TodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Suspense fallback={<TodoViewSkeleton />}>
        <TodoView params={params} />
      </Suspense>
    </div>
  );
}
