import {
  getTodos,
  type GetTodosQueryParams,
  serializeQueryParams,
  type Todo,
} from "@rvct/shared";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { ScrollArea } from "~/shared/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/shared/ui/pagination";
import { buttonVariants } from "~/shared/ui/button";
import { cn } from "~/shared/lib/component";
import { generatePageNumbers } from "~/shared/lib/pagination";
import { assigns } from "~/shared/lib/session";

type TodosResponseWithMeta = Awaited<ReturnType<typeof getTodos>> & {
  links?: Record<string, string>;
  meta?: {
    page?: {
      total?: number;
    };
    statuses?: unknown;
  };
};

type TodoStatusColumn = {
  key: string;
  todos: Todo[];
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

  const page = getPageObject(query.page);

  const response = (await getTodos(
    page
      ? {
          ...query,
          page: { ...page, count: true },
        }
      : query.page === undefined
        ? {
            ...query,
            page: { count: true },
          }
        : query,
  )) as TodosResponseWithMeta;

  const links = response.links ?? {};
  const todos = response.data || [];

  const limit =
    getPositiveInteger(page?.limit) ??
    getPositiveInteger(getPageParamFromLink(links.self, "limit")) ??
    getPositiveInteger(todos.length) ??
    1;
  const offset =
    getNonNegativeInteger(page?.offset) ??
    getNonNegativeInteger(getPageParamFromLink(links.self, "offset")) ??
    0;
  const sort =
    typeof query.sort === "string" && query.sort.trim().length > 0
      ? query.sort
      : undefined;
  const currentPage = Math.floor(offset / limit) + 1;

  const hasPrevPage = !!links.prev;
  const hasNextPage = !!links.next;

  const totalCount = response.meta?.page?.total ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  const buildPageUrl = (page: number) => {
    const queryParams = serializeQueryParams<GetTodosQueryParams>({
      ...query,
      page: { limit, offset: (page - 1) * limit },
      ...(sort ? { sort } : {}),
    });
    return `/?${new URLSearchParams(queryParams).toString()}`;
  };

  const statusColumns = getStatusColumns(todos, response.meta?.statuses);
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

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Link
              href={hasPrevPage ? buildPageUrl(currentPage - 1) : "#"}
              aria-label="Go to previous page"
              aria-disabled={!hasPrevPage}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-9",
                !hasPrevPage && "pointer-events-none opacity-50",
              )}
            >
              <ChevronLeftIcon />
            </Link>
          </PaginationItem>

          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <Link
                href={buildPageUrl(pageNum)}
                aria-current={pageNum === currentPage ? "page" : undefined}
                aria-label={`Go to page ${pageNum}`}
                className={cn(
                  buttonVariants({
                    variant: pageNum === currentPage ? "outline" : "ghost",
                    size: "icon",
                  }),
                  "size-9",
                )}
              >
                {pageNum}
              </Link>
            </PaginationItem>
          ))}

          <PaginationItem>
            <Link
              href={hasNextPage ? buildPageUrl(currentPage + 1) : "#"}
              aria-label="Go to next page"
              aria-disabled={!hasNextPage}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-9",
                !hasNextPage && "pointer-events-none opacity-50",
              )}
            >
              <ChevronRightIcon />
            </Link>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function getStatusColumns(
  todos: Todo[],
  metaStatuses: unknown,
): TodoStatusColumn[] {
  const statusesFromMeta = Array.isArray(metaStatuses)
    ? metaStatuses.filter(
        (status): status is string => typeof status === "string",
      )
    : [];
  const todosByStatus = new Map<string, Todo[]>(
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

function getPositiveInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const parsed = Math.trunc(value);
  return parsed > 0 ? parsed : undefined;
}

function getNonNegativeInteger(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const parsed = Math.trunc(value);
  return parsed >= 0 ? parsed : undefined;
}

function getPageParamFromLink(
  link: unknown,
  key: "limit" | "offset",
): number | undefined {
  if (typeof link !== "string" || link.trim().length === 0) {
    return undefined;
  }

  try {
    const url = new URL(link, "http://localhost");
    const value = url.searchParams.get(`page[${key}]`);

    if (!value) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
  } catch {
    return undefined;
  }
}

function getPageObject(
  value: unknown,
): GetTodosQueryParams["page"] | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as GetTodosQueryParams["page"];
}

function formatTodoPriority(priority: unknown): string {
  if (typeof priority !== "string" || priority.trim().length === 0) {
    return "MEDIUM";
  }

  return priority.replace(/[_\s]+/g, " ").toUpperCase();
}
