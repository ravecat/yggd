import { beforeEach, describe, expect, jest, test } from "@jest/globals";
const fetchCurrentUserTodosMock = jest.fn();

jest.mock("~/shared/lib/todos", () => ({
  fetchCurrentUserTodos: fetchCurrentUserTodosMock,
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("~/shared/lib/session", () => ({
  assigns: jest.fn(),
}));

jest.mock("@rvct/shared", () => ({
  postTodos: jest.fn(),
  ValidationError: class ValidationError extends Error {},
}));

describe("fetchTodosAction", () => {
  beforeEach(() => {
    fetchCurrentUserTodosMock.mockReset();
  });

  test("delegates to shared server-side fetcher", async () => {
    fetchCurrentUserTodosMock.mockResolvedValue({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });

    const { fetchTodosAction } = await import("./todos");
    const result = await fetchTodosAction({
      filter: {
        title: { contains: "  roadmap  " },
      },
      sort: "-updated_at",
    });

    expect(fetchCurrentUserTodosMock).toHaveBeenCalledWith({
      filter: {
        title: { contains: "  roadmap  " },
      },
      sort: "-updated_at",
    });
    expect(result).toEqual({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });
});
