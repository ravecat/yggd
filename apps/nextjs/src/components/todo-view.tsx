import { getTodosId } from "@rvct/shared";
import { notFound } from "next/navigation";

export async function TodoView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getTodosId(id);
  const todo = response.data;

  if (!todo) {
    notFound();
  }

  return (
    <article className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-4">
        {todo.attributes?.title || "Untitled"}
      </h1>

      {todo.attributes?.created_at && (
        <time className="text-sm text-gray-600 mb-6 block">
          {new Date(todo.attributes.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}

      <div className="mt-6 text-gray-800 whitespace-pre-wrap leading-relaxed">
        {todo.attributes?.content}
      </div>
    </article>
  );
}
