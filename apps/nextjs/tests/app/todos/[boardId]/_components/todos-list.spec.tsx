import { act } from "react";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const fetchMock = jest.fn();

global.fetch = fetchMock;

jest.mock("~/shared/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("TodosList", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    jest.useFakeTimers();
  });

  test("renders initial data", async () => {
    const { TodosList } =
      await import("~/app/todos/[boardId]/_components/todos-list");

    render(
      <TodosList
        boardId="board-1"
        initialData={{
          statuses: ["backlog"],
          todos: [
            {
              id: "todo-1",
              attributes: {
                title: "Roadmap",
                priority: "high",
                status: "backlog",
              },
            },
          ],
        }}
      >
        <button type="button">Create task</button>
      </TodosList>,
    );

    expect(screen.getByRole("button", { name: "Create task" })).toBeVisible();
    expect(screen.getAllByText("Roadmap")).toHaveLength(2);
    expect(screen.getAllByText("backlog")).toHaveLength(2);
  });

  test("refetches todos when the local filter changes", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        statuses: ["backlog"],
        todos: [
          {
            id: "todo-2",
            attributes: {
              title: "Filtered roadmap",
              priority: "low",
              status: "backlog",
            },
          },
        ],
      }),
    });

    const { TodosList } =
      await import("~/app/todos/[boardId]/_components/todos-list");

    render(
      <TodosList
        boardId="board-1"
        initialData={{
          statuses: ["backlog"],
          todos: [
            {
              id: "todo-1",
              attributes: {
                title: "Roadmap",
                priority: "high",
                status: "backlog",
              },
            },
          ],
        }}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Filter tasks" }), {
      target: { value: "roadmap" },
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/todos?boardId=board-1&filter=roadmap",
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Filtered roadmap")).toHaveLength(2);
    });
  });

  test("renders the empty state when there are no todos", async () => {
    const { TodosList } =
      await import("~/app/todos/[boardId]/_components/todos-list");

    render(
      <TodosList
        boardId="board-1"
        initialData={{
          statuses: [],
          todos: [],
        }}
      />,
    );

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    expect(
      screen.getByText("This board does not have any tasks yet."),
    ).toBeInTheDocument();
  });
});
