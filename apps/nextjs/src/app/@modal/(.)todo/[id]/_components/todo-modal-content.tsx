import { getTodosId, ValidationError } from "@rvct/shared";
import { notFound } from "next/navigation";
import { config } from "~/shared/lib/api";
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
  return responseStatus === 403 || responseStatus === 404;
}

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

export async function TodoModalContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let response: Awaited<ReturnType<typeof getTodosId>>;

  try {
    response = await getTodosId(id, undefined, await config());
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
