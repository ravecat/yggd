import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TODOS_CONFIG } from "@rvct/shared";

function handleTodosRequest(request: NextRequest): NextResponse {
  const { searchParams } = request.nextUrl;
  const url = request.nextUrl.clone();

  if (!searchParams.has("page[limit]")) {
    url.searchParams.set(
      "page[limit]",
      String(TODOS_CONFIG.page.limit.default),
    );
  }

  if (!searchParams.has("page[offset]")) {
    url.searchParams.set(
      "page[offset]",
      String(TODOS_CONFIG.page.offset.default),
    );
  }

  if (!searchParams.has("sort")) {
    url.searchParams.set("sort", TODOS_CONFIG.sort.default);
  }

  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return handleTodosRequest(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
