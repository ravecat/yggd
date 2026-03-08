import {
  getTodos,
  getTodosQueryParamsSchema,
  type GetTodosQueryParams,
  type MetaStatusesEnumKey,
  type Todo,
} from "@rvct/shared";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { ScrollArea } from "~/shared/ui/scroll-area";
import { assigns } from "~/shared/lib/session";

export async function TodosList({ query }: { query: GetTodosQueryParams }) {
  const { userId } = await assigns();

  if (!userId) {
    return (
      <div className="flex min-h-80 flex-1 items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          Sign in to manage tasks.
        </p>
      </div>
    );
  }

  const todosQuery = getTodosQueryParamsSchema.parse({
    ...query,
    filter: {
      ...(query.filter ?? {}),
      user_id: { eq: userId },
    },
  });
  const response = await getTodos(todosQuery);
  const todos = response.data ?? [];
  const todoStatusColumns = getTodoByStatusColumns(
    todos,
    response.meta?.statuses,
  );
  const hasTasks = todos.length > 0;

  if (!hasTasks) {
    return (
      <div className="flex min-h-80 flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Create task</span> to
            add your first item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="grid auto-cols-fr grid-flow-col gap-4">
        {todoStatusColumns.map((column) => (
          <header
            key={column.key}
            className="flex items-center justify-between border-b border-border py-2"
          >
            <span className="text-sm font-semibold leading-5 text-foreground">
              {column.key}
            </span>

            <div className="flex items-center gap-0.5 text-muted-foreground">
              <button
                aria-label={`Add task in ${column.key}`}
                className="inline-flex size-6 items-center justify-center rounded-sm transition hover:bg-accent hover:text-foreground"
                type="button"
              >
                <PlusIcon className="size-3.5" />
              </button>
            </div>
          </header>
        ))}
      </div>

      <ScrollArea className="h-0 flex-1">
        <div className="grid min-h-full auto-cols-fr grid-flow-col gap-4">
          {todoStatusColumns.map((column) => (
            <section
              key={column.key}
              className="flex h-full min-h-full flex-col"
            >
              <div className="flex flex-1 flex-col gap-2.5">
                {column.todos.map((todo) => (
                  <Link
                    key={todo.id}
                    href={`/todo/${todo.id}`}
                    className="rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                        {todo.attributes?.title || "Untitled"}
                      </h3>
                      <span className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
                        {todo.attributes?.priority}
                      </span>
                    </div>

                    {todo.attributes?.content && (
                      <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {todo.attributes.content}
                      </p>
                    )}

                    {todo.attributes?.created_at && (
                      <time className="block text-[11px] text-muted-foreground">
                        {new Date(
                          todo.attributes.created_at,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function getTodoByStatusColumns(
  todos: Todo[],
  metaStatuses?: MetaStatusesEnumKey[],
) {
  const todoByStatus = new Map<string, Todo[]>(
    (metaStatuses ?? []).map((status) => [status, []]),
  );

  for (const todo of todos) {
    if (!todo.attributes) {
      continue;
    }

    const status = todo.attributes.status;
    const bucket = todoByStatus.get(status);
    if (bucket) {
      bucket.push(todo);
      continue;
    }

    todoByStatus.set(status, [todo]);
  }

  return Array.from(todoByStatus.entries()).map(([key, bucket]) => ({
    key,
    todos: bucket,
  }));
}
