import {
  getTodos,
  type GetTodosQueryParams,
  type MetaStatusesEnum,
  type Todo,
} from "@rvct/shared";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { ScrollArea } from "~/shared/ui/scroll-area";
import { assigns } from "~/shared/lib/session";

type TodoStatusColumn = {
  key: string;
  todos: Todo[];
};

type TodosQueryWithFilter = GetTodosQueryParams & {
  filter?: {
    user_id?: {
      eq?: string;
    };
  };
};

export async function TodosList({
  query,
}: {
  query: Partial<GetTodosQueryParams>;
}) {
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

  const { page: _unusedPage, ...queryWithoutPage } = query;
  const todosQuery: TodosQueryWithFilter = {
    ...(queryWithoutPage as GetTodosQueryParams),
    filter: { user_id: { eq: userId } },
  };
  const { todos, statuses } = await getAllTodos(todosQuery);
  const statusColumns = getStatusColumns(todos, statuses);
  const hasTasks = todos.length > 0;
  const columnCount = Math.max(statusColumns.length, 1);
  const columnsStyle = {
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
  };

  if (statusColumns.length === 0 && !hasTasks) {
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
      <div className="grid gap-4" style={columnsStyle}>
        {statusColumns.map((column) => (
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
        <div className="grid min-h-full gap-4" style={columnsStyle}>
          {statusColumns.map((column) => (
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
                      <span className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {formatTodoPriority(todo.attributes?.priority)}
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

const TODOS_PAGE_LIMIT = 100;

async function getAllTodos(
  query: TodosQueryWithFilter,
): Promise<{ todos: Todo[]; statuses?: MetaStatusesEnum[] }> {
  const todos: Todo[] = [];
  let offset = 0;
  let statuses: MetaStatusesEnum[] | undefined;

  while (true) {
    const response = await getTodos({
      ...query,
      page: { limit: TODOS_PAGE_LIMIT, offset },
    });
    const chunk = response.data ?? [];

    if (statuses === undefined) {
      statuses = response.meta?.statuses;
    }

    todos.push(...chunk);

    if (chunk.length < TODOS_PAGE_LIMIT) {
      break;
    }

    offset += TODOS_PAGE_LIMIT;
  }

  return { todos, statuses };
}

function getStatusColumns(
  todos: Todo[],
  metaStatuses?: MetaStatusesEnum[],
): TodoStatusColumn[] {
  const statusesFromMeta = metaStatuses ?? [];
  const todosByStatus = new Map<MetaStatusesEnum, Todo[]>(
    statusesFromMeta.map((status) => [status, []]),
  );

  for (const todo of todos) {
    const status = todo.attributes?.status;
    if (typeof status !== "string") {
      continue;
    }

    const bucket = todosByStatus.get(status);
    if (bucket) {
      bucket.push(todo);
      continue;
    }

    todosByStatus.set(status, [todo]);
  }

  return Array.from(todosByStatus.entries()).map(([key, bucket]) => ({
    key,
    todos: bucket,
  }));
}

function formatTodoPriority(priority: unknown): string {
  if (typeof priority !== "string" || priority.trim().length === 0) {
    return "MEDIUM";
  }

  return priority.replace(/[_\s]+/g, " ").toUpperCase();
}
