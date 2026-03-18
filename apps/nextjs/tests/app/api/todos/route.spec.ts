/** @jest-environment node */

import { describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";

const fetchTodosMock = jest.fn();

jest.mock("~/features/todos/query", () => ({
  fetchTodos: fetchTodosMock,
}));

describe("GET /api/todos", () => {
  test("returns todos for the requested board and filter", async () => {
    fetchTodosMock.mockResolvedValue({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });

    const { GET } = await import("~/app/api/todos/route");
    const response = await GET(
      new NextRequest(
        "http://localhost/api/todos?boardId=board-1&filter=roadmap",
      ),
    );

    expect(fetchTodosMock).toHaveBeenCalledWith("board-1", {
      filter: {
        title: { contains: "roadmap" },
      },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });

  test("returns 400 when boardId is missing", async () => {
    const { GET } = await import("~/app/api/todos/route");
    const response = await GET(new NextRequest("http://localhost/api/todos"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "boardId query parameter is required",
    });
  });

  test("returns 500 when the upstream fetch fails", async () => {
    fetchTodosMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("~/app/api/todos/route");
    const response = await GET(
      new NextRequest("http://localhost/api/todos?boardId=board-1"),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Failed to load todos",
    });
  });
});
