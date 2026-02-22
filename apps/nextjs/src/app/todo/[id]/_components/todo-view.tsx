import { notFound } from "next/navigation";
import { getTodosId, ValidationError } from "@rvct/shared";

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

export async function TodoView({
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
    <>
      <h1 className="mb-6 text-4xl font-bold">
        {todo.attributes?.title || "Untitled"}
      </h1>

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
          <span className="capitalize">
            {todo.attributes?.priority || "medium"} priority
          </span>
        </div>
      )}

      <div className="mt-8 whitespace-pre-wrap text-gray-800 leading-relaxed">
        {todo.attributes?.content}
      </div>
    </>
  );
}
