import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type {
  GetTodosQueryParams,
  MetaStatusesEnumKey,
  Todo,
} from "@rvct/shared";

const fetchTodosMock = jest.fn<
  (params?: GetTodosQueryParams) => Promise<{
    statuses: string[];
    todos: { id: string }[];
  }>
>();

jest.mock("~/app/actions/todos", () => ({
  fetchTodosAction: fetchTodosMock,
}));

describe("TodosProvider", () => {
  beforeEach(() => {
    fetchTodosMock.mockReset();
    fetchTodosMock.mockResolvedValue({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });

  test("keeps todos state and builds fetch params for sort and search", async () => {
    const { TodosProvider, useTodosContext } = await import("./todos");

    function TodosConsumer() {
      const { setSearchValue, toggleSortField, todos } = useTodosContext();

      return (
        <div>
          <div data-testid="todos-count">{todos.length}</div>
          <button type="button" onClick={() => toggleSortField("priority")}>
            Toggle priority
          </button>
          <button type="button" onClick={() => setSearchValue("  roadmap  ")}>
            Set search
          </button>
        </div>
      );
    }

    render(
      <TodosProvider
        statuses={["backlog"] as MetaStatusesEnumKey[]}
        todos={[{ id: "todo-1" }] as Todo[]}
      >
        <TodosConsumer />
      </TodosProvider>,
    );

    expect(screen.getByTestId("todos-count").textContent).toBe("1");
    expect(fetchTodosMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Toggle priority" }));

    await waitFor(() =>
      expect(fetchTodosMock).toHaveBeenLastCalledWith({
        sort: "priority",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle priority" }));

    await waitFor(() =>
      expect(fetchTodosMock).toHaveBeenLastCalledWith({
        sort: "-priority",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Set search" }));

    await waitFor(() =>
      expect(fetchTodosMock).toHaveBeenLastCalledWith({
        filter: {
          title: { contains: "roadmap" },
        },
        sort: "-priority",
      }),
    );
  });

  test("fetches the empty query after clearing an active filter", async () => {
    const { TodosProvider, useTodosContext } = await import("./todos");

    function TodosConsumer() {
      const { setSearchValue } = useTodosContext();

      return (
        <div>
          <button type="button" onClick={() => setSearchValue("roadmap")}>
            Set search
          </button>
          <button type="button" onClick={() => setSearchValue("")}>
            Clear search
          </button>
        </div>
      );
    }

    render(
      <TodosProvider
        statuses={["backlog"] as MetaStatusesEnumKey[]}
        todos={[{ id: "todo-1" }] as Todo[]}
      >
        <TodosConsumer />
      </TodosProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Set search" }));

    await waitFor(() =>
      expect(fetchTodosMock).toHaveBeenLastCalledWith({
        filter: {
          title: { contains: "roadmap" },
        },
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    await waitFor(() => expect(fetchTodosMock).toHaveBeenLastCalledWith({}));
  });

  test("ignores stale responses from older requests", async () => {
    let resolveFirstRequest:
      | ((value: { statuses: string[]; todos: { id: string }[] }) => void)
      | undefined;
    let resolveSecondRequest:
      | ((value: { statuses: string[]; todos: { id: string }[] }) => void)
      | undefined;

    fetchTodosMock.mockReset();
    fetchTodosMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstRequest = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondRequest = resolve;
          }),
      );

    const { TodosProvider, useTodosContext } = await import("./todos");

    function TodosConsumer() {
      const { toggleSortField, todos } = useTodosContext();

      return (
        <div>
          <div data-testid="todos-count">{todos.length}</div>
          <button type="button" onClick={() => toggleSortField("priority")}>
            Toggle priority
          </button>
        </div>
      );
    }

    render(
      <TodosProvider
        statuses={["backlog"] as MetaStatusesEnumKey[]}
        todos={[{ id: "todo-1" }] as Todo[]}
      >
        <TodosConsumer />
      </TodosProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle priority" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle priority" }));

    resolveSecondRequest?.({
      statuses: ["backlog"],
      todos: [{ id: "todo-2" }, { id: "todo-3" }],
    });

    await waitFor(() =>
      expect(screen.getByTestId("todos-count").textContent).toBe("2"),
    );

    resolveFirstRequest?.({
      statuses: ["backlog"],
      todos: [{ id: "todo-stale" }],
    });

    await waitFor(() =>
      expect(screen.getByTestId("todos-count").textContent).toBe("2"),
    );
  });
});
