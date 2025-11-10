import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { POSTS_CONFIG } from "@yggd/shared";

function handlePostsRequest(request: NextRequest): NextResponse {
  const { searchParams } = request.nextUrl;

  const hasLimit = searchParams.has("page[limit]");
  const hasOffset = searchParams.has("page[offset]");
  const hasSort = searchParams.has("sort");

  if (hasLimit && hasOffset && hasSort) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (!hasLimit) {
    url.searchParams.set("page[limit]", String(POSTS_CONFIG.page.limit.default));
  }

  if (!hasOffset) {
    url.searchParams.set("page[offset]", String(POSTS_CONFIG.page.offset.default));
  }

  if (!hasSort) {
    url.searchParams.set("sort", POSTS_CONFIG.sort.default);
  }

  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return handlePostsRequest(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
