import { getPosts } from "@yggd/shared";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/shared/ui/pagination";
import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/component";
import { generatePageNumbers } from "@/shared/lib/pagination";
import { parseQueryParams } from "@/shared/lib/query";
import type { AsyncSearchParams } from "@/shared/types";
import type { GetPostsQueryParams } from "@yggd/shared";

type PostsResponseWithMeta = Awaited<ReturnType<typeof getPosts>> & {
  meta?: {
    page?: {
      total?: number;
    };
  };
};

export async function PostsList({
  searchParams,
}: {
  searchParams: AsyncSearchParams<GetPostsQueryParams>;
}) {
  const params = await searchParams;
  const parsed = parseQueryParams<GetPostsQueryParams>(params);
  const { page, sort } = parsed;

  const limit = page!.limit!;
  const offset = page!.offset!;
  const currentPage = Math.floor(offset / limit) + 1;

  const response = (await getPosts({
    page: { limit, offset, count: true },
    sort: sort!,
  })) as PostsResponseWithMeta;

  const posts = response.data || [];
  const links = (response as any).links || {};
  const hasPrevPage = !!links.prev;
  const hasNextPage = !!links.next;

  const totalCount = response.meta?.page?.total ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  const buildPageUrl = (page: number) => {
    const params: [string, string][] = [
      ["page[limit]", String(limit)],
      ["page[offset]", String((page - 1) * limit)],
      ...(sort ? [["sort", sort] as [string, string]] : []),
    ];
    return `/?${new URLSearchParams(params).toString()}`;
  };

  if (posts.length === 0) {
    return <p className="text-lg text-gray-600">No posts yet.</p>;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea className="flex-1 h-0">
        <div className="flex flex-col gap-4 pr-4 pb-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {post.attributes?.title || "Untitled"}
                </CardTitle>
                <CardDescription>
                  {post.attributes?.created_at && (
                    <>
                      {new Date(
                        post.attributes.created_at
                      ).toLocaleDateString()}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="leading-normal text-sm text-gray-700">
                  {post.attributes?.content ? (
                    <>
                      {post.attributes.content.substring(0, 200)}
                      {post.attributes.content.length > 200 ? "..." : ""}
                    </>
                  ) : null}
                </p>
              </CardContent>
            </Card>
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
                !hasPrevPage && "pointer-events-none opacity-50"
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
                  })
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
                !hasNextPage && "pointer-events-none opacity-50"
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
