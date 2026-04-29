import { notFound } from "next/navigation";
import { fetchTodo } from "~/features/todos/query";
import { Modal } from "~/shared/ui/modal";

export function TodoModalFallback() {
  return (
    <Modal title="Loading...">
      <article className="animate-pulse">
        <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 rounded bg-gray-200" />
          <div className="h-3 w-5/6 rounded bg-gray-200" />
          <div className="h-3 w-2/3 rounded bg-gray-200" />
        </div>
      </article>
    </Modal>
  );
}

export async function TodoModalContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const todo = await fetchTodo(id);

  if (!todo) {
    notFound();
  }

  return (
    <Modal title={todo.attributes?.title}>
      <article className="prose max-w-none">
        {todo.attributes?.created_at && (
          <time className="text-xs text-gray-500 mb-4 block">
            {new Date(todo.attributes.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}

        <div className="mt-4 text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
          {todo.attributes?.content}
        </div>
      </article>
    </Modal>
  );
}
