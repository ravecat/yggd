import { Suspense } from "react";
import Link from "next/link";
import { TodoView } from "./_components/todo-view";
import { TodoViewSkeleton } from "./_components/todo-view-skeleton";

export default function TodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
      >
        ← Back to todos
      </Link>

      <Suspense fallback={<TodoViewSkeleton />}>
        <TodoView params={params} />
      </Suspense>
    </div>
  );
}
