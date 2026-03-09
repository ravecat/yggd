import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const assignsMock = jest.fn();
const getTodosMock = jest.fn();
const parseQueryMock = jest.fn();

jest.mock("./session", () => ({
  assigns: assignsMock,
}));

jest.mock("@rvct/shared", () => ({
  getTodos: getTodosMock,
  getTodosQueryParamsSchema: {
    parse: parseQueryMock,
  },
}));

describe("fetchTodos", () => {
  beforeEach(() => {
    assignsMock.mockReset();
    getTodosMock.mockReset();
    parseQueryMock.mockReset();
  });

  test("validates query params before requesting todos", async () => {
    const validatedQuery = {
      filter: {
        title: { contains: "roadmap" },
      },
      sort: "-updated_at",
    };

    parseQueryMock.mockReturnValue(validatedQuery);
    getTodosMock.mockResolvedValue({
      data: [{ id: "todo-1" }],
      meta: { statuses: ["backlog"] },
    });

    const { fetchTodos } = await import("./todos");
    const result = await fetchTodos(validatedQuery);

    expect(parseQueryMock).toHaveBeenCalledWith(validatedQuery);
    expect(getTodosMock).toHaveBeenCalledWith(validatedQuery);
    expect(result).toEqual({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });

  test("passes empty query by default", async () => {
    parseQueryMock.mockReturnValue({});
    getTodosMock.mockResolvedValue({
      data: [],
      meta: {},
    });

    const { fetchTodos } = await import("./todos");
    await fetchTodos();

    expect(parseQueryMock).toHaveBeenCalledWith({});
    expect(getTodosMock).toHaveBeenCalledWith({});
  });

  test("injects the current user filter into the query", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    parseQueryMock.mockImplementation((query) => query);
    getTodosMock.mockResolvedValue({
      data: [{ id: "todo-1" }],
      meta: { statuses: ["backlog"] },
    });

    const { fetchCurrentUserTodos } = await import("./todos");
    const result = await fetchCurrentUserTodos({
      filter: {
        title: { contains: "roadmap" },
        user_id: { eq: "user-2" },
      },
      sort: "-updated_at",
    });

    expect(parseQueryMock).toHaveBeenCalledWith({
      filter: {
        title: { contains: "roadmap" },
        user_id: { eq: "user-1" },
      },
      sort: "-updated_at",
    });
    expect(getTodosMock).toHaveBeenCalledWith({
      filter: {
        title: { contains: "roadmap" },
        user_id: { eq: "user-1" },
      },
      sort: "-updated_at",
    });
    expect(result).toEqual({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });

  test("rejects unauthenticated access for current user todos", async () => {
    assignsMock.mockResolvedValue({ userId: null });

    const { fetchCurrentUserTodos } = await import("./todos");

    await expect(fetchCurrentUserTodos()).rejects.toThrow(
      "Authentication required to view todos",
    );
    expect(parseQueryMock).not.toHaveBeenCalled();
    expect(getTodosMock).not.toHaveBeenCalled();
  });
});
