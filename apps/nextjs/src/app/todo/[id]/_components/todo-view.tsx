import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchTodo } from "~/features/todos/query";

export async function TodoView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const todo = await fetchTodo(id);

  if (!todo) {
    notFound();
  }

  return (
    <>
      {todo.attributes?.board_id ? (
        <Link
          href={`/todos/${todo.attributes.board_id}`}
          className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to board
        </Link>
      ) : null}

      <h1 className="mb-6 text-4xl font-bold">{todo.attributes?.title || "Untitled"}</h1>

      {todo.attributes?.created_at && (
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <time>
            {new Date(todo.attributes.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>-</span>
          <span className="capitalize">{todo.attributes?.priority || "medium"} priority</span>
        </div>
      )}

      <div className="mt-8 whitespace-pre-wrap text-gray-800 leading-relaxed">
        {todo.attributes?.content}
      </div>
    </>
  );
}
