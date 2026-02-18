import { getTodosId, ValidationError } from "@rvct/shared";
import { notFound } from "next/navigation";
import { Modal } from "~/shared/ui/modal";

function shouldRenderNotFound(error: unknown): boolean {
  if (error instanceof ValidationError) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const responseStatus = (error as { response?: { status?: number } }).response
    ?.status;
  return responseStatus === 404;
}

export default async function TodoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let response: Awaited<ReturnType<typeof getTodosId>>;

  try {
    response = await getTodosId(id);
  } catch (error) {
    if (shouldRenderNotFound(error)) {
      notFound();
    }

    throw error;
  }

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
