import { NextRequest, NextResponse } from "next/server";
import { fetchTodos } from "~/features/todos/query";

export async function GET(request: NextRequest) {
  const boardId = request.nextUrl.searchParams.get("boardId");

  if (!boardId) {
    return NextResponse.json(
      { message: "boardId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const filter = request.nextUrl.searchParams.get("filter");
    const result = await fetchTodos(
      boardId,
      filter
        ? {
            filter: {
              title: { contains: filter },
            },
          }
        : {},
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to load todos route data:", error);

    return NextResponse.json(
      { message: "Failed to load todos" },
      { status: 500 },
    );
  }
}
