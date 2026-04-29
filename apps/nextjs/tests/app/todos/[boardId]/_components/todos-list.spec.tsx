import "@testing-library/jest-dom";
import { describe, expect, jest, test } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

jest.mock("~/shared/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

function createTodo(
  id: string,
  overrides: Partial<{
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "blocked" | "backlog" | "in_progress" | "review" | "done" | "rejected";
    content: string;
    created_at: string;
    updated_at: string;
  }> = {},
) {
  return {
    id,
    type: "todo",
    attributes: {
      board_id: "board-1",
      content: overrides.content ?? "Task details",
      created_at: overrides.created_at ?? "2026-03-18T10:00:00.000Z",
      priority: overrides.priority ?? "medium",
      status: overrides.status ?? "backlog",
      title: overrides.title ?? `Task ${id}`,
      updated_at: overrides.updated_at ?? "2026-03-19T10:00:00.000Z",
    },
  };
}

describe("TodosList", () => {
  test("renders initial data", async () => {
    const { TodosList } = await import("~/app/todos/[boardId]/_components/todos-list");

    render(
      <TodosList
        data={{
          statuses: ["backlog"],
          todos: [
            createTodo("todo-1", {
              title: "Roadmap",
              priority: "high",
              status: "backlog",
            }),
          ],
        }}
      />,
    );

    expect(screen.getAllByText("Roadmap")).toHaveLength(2);
    expect(screen.getAllByText("backlog")).toHaveLength(2);
  });

  test("preserves the order returned by the server inside a column", async () => {
    const { TodosList } = await import("~/app/todos/[boardId]/_components/todos-list");

    render(
      <TodosList
        data={{
          statuses: ["backlog"],
          todos: [
            createTodo("todo-1", {
              title: "Zulu planning",
              priority: "high",
            }),
            createTodo("todo-2", {
              title: "Urgent fix",
              priority: "urgent",
            }),
            createTodo("todo-3", {
              title: "Alpha planning",
              priority: "high",
            }),
          ],
        }}
      />,
    );

    expect(screen.getAllByRole("heading", { level: 3 }).map((item) => item.textContent)).toEqual([
      "Zulu planning",
      "Urgent fix",
      "Alpha planning",
      "Zulu planning",
      "Urgent fix",
      "Alpha planning",
    ]);
  });

  test("renders the empty state when there are no todos", async () => {
    const { TodosList } = await import("~/app/todos/[boardId]/_components/todos-list");

    render(
      <TodosList
        data={{
          statuses: [],
          todos: [],
        }}
      />,
    );

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    expect(screen.getByText("This board does not have any tasks yet.")).toBeInTheDocument();
  });
});
