import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { POSTS_CONFIG } from "@rvct/shared";

function handlePostsRequest(request: NextRequest): NextResponse {
  const { searchParams } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (!searchParams.has("page[limit]")) {
    url.searchParams.set("page[limit]", String(POSTS_CONFIG.page.limit.default));
  }

  if (!searchParams.has("page[offset]")) {
    url.searchParams.set("page[offset]", String(POSTS_CONFIG.page.offset.default));
  }

  if (!searchParams.has("sort")) {
    url.searchParams.set("sort", POSTS_CONFIG.sort.default);
  }

  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return handlePostsRequest(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
