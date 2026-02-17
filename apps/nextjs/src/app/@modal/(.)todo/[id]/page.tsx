import { getTodosId } from "@rvct/shared";
import { notFound } from "next/navigation";
import { Modal } from "@/shared/ui/modal";

export default async function TodoModal({
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
