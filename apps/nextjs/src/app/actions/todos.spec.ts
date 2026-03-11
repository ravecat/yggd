import { beforeEach, describe, expect, jest, test } from "@jest/globals";
const getTodosMock = jest.fn();
const parseQueryMock = jest.fn();
const assignsMock = jest.fn();

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("~/shared/lib/session", () => ({
  assigns: assignsMock,
}));

jest.mock("@rvct/shared", () => ({
  getTodos: getTodosMock,
  getTodosQueryParamsSchema: {
    parse: parseQueryMock,
  },
  postTodos: jest.fn(),
  ValidationError: class ValidationError extends Error {},
}));

describe("fetchTodosAction", () => {
  beforeEach(() => {
    getTodosMock.mockReset();
    parseQueryMock.mockReset();
    assignsMock.mockReset();
  });

  test("injects the current user filter and validates the query", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    const validatedQuery = {
      filter: {
        title: { contains: "  roadmap  " },
        user_id: { eq: "user-1" },
      },
      sort: "-updated_at",
    };

    parseQueryMock.mockReturnValue(validatedQuery);
    getTodosMock.mockResolvedValue({
      statuses: ["backlog"],
      data: [{ id: "todo-1" }],
      meta: { statuses: ["backlog"] },
    });

    const { fetchTodosAction } = await import("./todos");
    const result = await fetchTodosAction({
      filter: {
        title: { contains: "  roadmap  " },
      },
      sort: "-updated_at",
    });

    expect(parseQueryMock).toHaveBeenCalledWith({
      filter: {
        title: { contains: "  roadmap  " },
        user_id: { eq: "user-1" },
      },
      sort: "-updated_at",
    });
    expect(getTodosMock).toHaveBeenCalledWith(validatedQuery);
    expect(result).toEqual({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });

  test("rejects unauthenticated access for current user todos", async () => {
    assignsMock.mockResolvedValue({ userId: null });

    const { fetchTodosAction } = await import("./todos");

    await expect(fetchTodosAction()).rejects.toThrow(
      "Authentication required to view todos",
    );
    expect(parseQueryMock).not.toHaveBeenCalled();
    expect(getTodosMock).not.toHaveBeenCalled();
  });

  test("passes empty query by default", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    const validatedQuery = {
      filter: {
        user_id: { eq: "user-1" },
      },
    };

    parseQueryMock.mockReturnValue(validatedQuery);
    getTodosMock.mockResolvedValue({
      data: [],
      meta: {},
    });

    const { fetchTodosAction } = await import("./todos");
    await fetchTodosAction();

    expect(parseQueryMock).toHaveBeenCalledWith(validatedQuery);
    expect(getTodosMock).toHaveBeenCalledWith(validatedQuery);
  });
});
