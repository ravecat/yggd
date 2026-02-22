import {
  getTodos,
  type GetTodosQueryParams,
  serializeQueryParams,
} from "@rvct/shared";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ScrollArea } from "~/shared/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/shared/ui/card";
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
  };
};

export async function TodosList({
  query,
}: {
  query: Partial<GetTodosQueryParams>;
}) {
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

  if (todos.length === 0) {
    const { userId } = await assigns();

    return (
      <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">No tasks yet</p>
          {userId ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Create task</span>{" "}
              to add your first item.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Sign in</span> to
              add tasks.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2">
      <ScrollArea className="flex-1 h-0">
        <div className="flex flex-col gap-4">
          {todos.map((todo) => (
            <Link key={todo.id} href={`/todo/${todo.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {todo.attributes?.title || "Untitled"}
                  </CardTitle>
                  <CardDescription>
                    {todo.attributes?.created_at && (
                      <>
                        <span className="uppercase tracking-wide text-xs mr-2">
                          {todo.attributes?.status || "todo"}
                        </span>
                        <span className="uppercase tracking-wide text-xs mr-2">
                          {todo.attributes?.priority || "medium"}
                        </span>
                        {new Date(
                          todo.attributes.created_at,
                        ).toLocaleDateString()}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="leading-normal text-sm text-gray-700">
                    {todo.attributes?.content ? (
                      <>
                        {todo.attributes.content.substring(0, 200)}
                        {todo.attributes.content.length > 200 ? "..." : ""}
                      </>
                    ) : null}
                  </p>
                </CardContent>
              </Card>
            </Link>
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
                buttonVariants({ variant: "ghost", size: "default" }),
                "gap-1 px-2.5 sm:pl-2.5",
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
                buttonVariants({ variant: "ghost", size: "default" }),
                "gap-1 px-2.5 sm:pr-2.5",
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
