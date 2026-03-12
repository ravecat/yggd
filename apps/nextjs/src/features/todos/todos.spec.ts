import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const getTodosMock = jest.fn();
const postTodosMock = jest.fn();
const parseQueryMock = jest.fn();
const assignsMock = jest.fn();
const configMock = jest.fn();
const revalidatePathMock = jest.fn();
const redirectMock = jest.fn();

class ValidationErrorMock extends Error {
  name = "ValidationError";

  traverseErrors = jest.fn();
}

jest.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

jest.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

jest.mock("~/features/boards/query", () => ({
  toBoardHref: (boardId: string) => `/todos/${boardId}`,
}));

jest.mock("~/shared/lib/api", () => ({
  config: configMock,
}));

jest.mock("~/shared/lib/session", () => ({
  assigns: assignsMock,
}));

jest.mock("@rvct/shared", () => ({
  getTodos: getTodosMock,
  getTodosQueryParamsSchema: {
    parse: parseQueryMock,
  },
  postTodos: postTodosMock,
  ValidationError: ValidationErrorMock,
}));

describe("fetchTodos", () => {
  beforeEach(() => {
    getTodosMock.mockReset();
    postTodosMock.mockReset();
    parseQueryMock.mockReset();
    assignsMock.mockReset();
    configMock.mockReset();
    revalidatePathMock.mockReset();
    redirectMock.mockReset();
  });

  test("injects the current board filter and validates the query", async () => {
    configMock.mockResolvedValue({
      headers: { Authorization: "Bearer token" },
    });
    const validatedQuery = {
      filter: {
        title: { contains: "  roadmap  " },
        board_id: { eq: "board-1" },
      },
      sort: "-updated_at",
    };

    parseQueryMock.mockReturnValue(validatedQuery);
    getTodosMock.mockResolvedValue({
      statuses: ["backlog"],
      data: [{ id: "todo-1" }],
      meta: { statuses: ["backlog"] },
    });

    const { fetchTodos } = await import("./query");
    const result = await fetchTodos("board-1", {
      filter: {
        title: { contains: "  roadmap  " },
      },
      sort: "-updated_at",
    });

    expect(parseQueryMock).toHaveBeenCalledWith({
      filter: {
        title: { contains: "  roadmap  " },
        board_id: { eq: "board-1" },
      },
      sort: "-updated_at",
    });
    expect(getTodosMock).toHaveBeenCalledWith(validatedQuery, {
      headers: { Authorization: "Bearer token" },
    });
    expect(result).toEqual({
      statuses: ["backlog"],
      todos: [{ id: "todo-1" }],
    });
  });

  test("passes empty query by default", async () => {
    configMock.mockResolvedValue({});
    const validatedQuery = {
      filter: {
        board_id: { eq: "board-1" },
      },
    };

    parseQueryMock.mockReturnValue(validatedQuery);
    getTodosMock.mockResolvedValue({
      data: [],
      meta: {},
    });

    const { fetchTodos } = await import("./query");
    await fetchTodos("board-1");

    expect(parseQueryMock).toHaveBeenCalledWith(validatedQuery);
    expect(getTodosMock).toHaveBeenCalledWith(validatedQuery, {});
  });
});

describe("createTodo", () => {
  beforeEach(() => {
    postTodosMock.mockReset();
    assignsMock.mockReset();
    configMock.mockReset();
    revalidatePathMock.mockReset();
    redirectMock.mockReset();
  });

  test("creates a todo for the selected board and redirects back to it", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({
      headers: { Authorization: "Bearer token" },
    });
    postTodosMock.mockResolvedValue({ data: { id: "todo-1" } });

    const formData = new FormData();
    formData.set("boardId", "board-1");
    formData.set("title", "Roadmap");
    formData.set("content", "Ship board sharing");
    formData.set("priority", "high");
    formData.set("status", "backlog");

    const { createTodo } = await import("./mutations");
    await createTodo({}, formData);

    expect(postTodosMock).toHaveBeenCalledWith(
      {
        data: {
          type: "todo",
          attributes: {
            board_id: "board-1",
            content: "Ship board sharing",
            priority: "high",
            status: "backlog",
            title: "Roadmap",
          },
        },
      },
      undefined,
      {
        headers: { Authorization: "Bearer token" },
      },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/todos/board-1");
    expect(redirectMock).toHaveBeenCalledWith("/todos/board-1");
  });

  test("returns a form error when board id is missing", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });

    const formData = new FormData();
    formData.set("title", "Roadmap");
    formData.set("content", "Ship board sharing");

    const { createTodo } = await import("./mutations");
    const result = await createTodo({}, formData);

    expect(result).toEqual({
      errors: {
        general: ["Board is required"],
      },
    });
    expect(postTodosMock).not.toHaveBeenCalled();
  });

  test("maps validation errors from the API", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({});

    const validationError = new ValidationErrorMock();
    validationError.traverseErrors.mockReturnValue({
      title: ["is required"],
      content: [],
      priority: [],
      status: [],
      board_id: [],
      general: [],
    });
    postTodosMock.mockRejectedValue(validationError);

    const formData = new FormData();
    formData.set("boardId", "board-1");
    formData.set("title", "");
    formData.set("content", "Ship board sharing");
    formData.set("priority", "high");
    formData.set("status", "backlog");

    const { createTodo } = await import("./mutations");
    const result = await createTodo({}, formData);

    expect(result).toEqual({
      errors: {
        title: ["is required"],
        content: [],
        priority: [],
        status: [],
        board_id: [],
        general: [],
      },
    });
  });
});
