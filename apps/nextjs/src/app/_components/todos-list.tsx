import {
  getTodosQueryParamsSchema,
  parseQueryString,
  type Todo,
} from "@rvct/shared";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { fetchTodos } from "~/features/todos/query";
import {
  toSearchParamsString,
  type RouteSearchParams,
} from "~/shared/lib/search-params";
import { ScrollArea } from "~/shared/ui/scroll-area";

type TodosListProps = {
  searchParams: Promise<RouteSearchParams>;
};

export async function TodosList({ searchParams }: TodosListProps) {
  const todosQuery = parseQueryString(
    toSearchParamsString(await searchParams),
    getTodosQueryParamsSchema,
  );
  const { statuses, todos } = await fetchTodos(todosQuery);
  const hasTasks = todos.length > 0;

  if (!hasTasks) {
    return (
      <div className="flex min-h-80 flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground">
            Create task to add your first item.
          </p>
        </div>
      </div>
    );
  }

  const columns = new Map<string, Todo[]>();

  for (const status of statuses) {
    columns.set(status, []);
  }

  for (const todo of todos) {
    const status = todo.attributes?.status;

    if (!status) {
      continue;
    }

    const bucket = columns.get(status);
    if (bucket) {
      bucket.push(todo);
      continue;
    }

    columns.set(status, [todo]);
  }

  const table = Array.from(columns, ([key, items]) => ({
    key,
    todos: items,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="h-0 flex-1 md:hidden">
        <div className="flex min-h-full flex-col gap-3">
          {table.map((column) => (
            <details key={column.key} className="group md:hidden">
              <summary className="flex list-none items-center justify-between gap-3 border-b border-border py-2 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="text-sm font-semibold leading-5 text-foreground">
                  {column.key}
                </span>

                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-[11px] font-medium">
                    {column.todos.length}
                  </span>
                  <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </span>
              </summary>

              <div className="hidden flex-col gap-2.5 py-3 group-open:flex">
                {column.todos.map((todo) => (
                  <Link
                    key={todo.id}
                    href={`/todo/${encodeURIComponent(todo.id)}`}
                    className="rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                        {todo.attributes?.title || "-"}
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
            </details>
          ))}
        </div>
      </ScrollArea>

      <div className="hidden min-h-0 flex-1 flex-col gap-3 md:flex">
        <div className="grid auto-cols-fr grid-flow-col gap-4">
          {table.map((column) => (
            <header
              key={column.key}
              className="flex items-center justify-between border-b border-border py-2"
            >
              <span className="text-sm font-semibold leading-5 text-foreground">
                {column.key}
              </span>

              <span className="text-[11px] font-medium text-muted-foreground">
                {column.todos.length}
              </span>
            </header>
          ))}
        </div>

        <ScrollArea className="h-0 flex-1">
          <div className="grid min-h-full auto-cols-fr grid-flow-col gap-4">
            {table.map((column) => (
              <section
                key={column.key}
                className="flex h-full min-h-full flex-col"
              >
                <div className="flex flex-1 flex-col gap-2.5">
                  {column.todos.map((todo) => (
                    <Link
                      key={todo.id}
                      href={`/todo/${encodeURIComponent(todo.id)}`}
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
    </div>
  );
}

export function TodosSkeleton() {
  return (
    <div className="p-4">
      <div className="grid min-h-[26rem] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, columnIndex) => (
          <section key={columnIndex} className="flex min-h-[26rem] flex-col">
            <header className="flex items-center justify-between border-b border-border py-2.5">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-14 animate-pulse rounded bg-muted" />
            </header>

            <div className="flex flex-1 flex-col gap-2.5 py-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <article
                  key={cardIndex}
                  className="rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <div className="mb-2 h-4 w-10/12 animate-pulse rounded bg-muted" />
                  <div className="mb-1.5 h-3 w-full animate-pulse rounded bg-muted/80" />
                  <div className="mb-3 h-3 w-8/12 animate-pulse rounded bg-muted/80" />
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
