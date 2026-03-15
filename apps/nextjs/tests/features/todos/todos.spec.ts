import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const getTodosMock = jest.fn();
const getTodosIdMock = jest.fn();
const postTodosMock = jest.fn();
const parseQueryMock = jest.fn();
const assignsMock = jest.fn();
const configMock = jest.fn();
const revalidatePathMock = jest.fn();
const redirectMock = jest.fn();
const mockGetErrorMessage = (
  errors: Array<{ detail?: string; title?: string }>,
  fallback = "Request failed",
) => errors[0]?.detail || errors[0]?.title || fallback;
const mockGetErrorStatus = (errors: Array<{ status?: string }>) => {
  const status = Number(errors[0]?.status);
  return Number.isInteger(status) ? status : null;
};
const mockApiError = class ApiError extends Error {
  readonly status: number | null;
  readonly raw: Array<{
    detail?: string;
    title?: string;
    status?: string;
    code?: string;
    source?: { parameter?: string; pointer?: string };
  }>;
  readonly errors: Partial<Record<string, string[]>>;

  private static getErrorKey(error: {
    source?: { parameter?: string; pointer?: string };
  }): string {
    const pointer = error.source?.pointer;

    if (pointer) {
      const parts = pointer
        .split("/")
        .filter(Boolean)
        .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));

      if (
        parts[0] === "data" &&
        (parts[1] === "attributes" || parts[1] === "relationships") &&
        parts[2]
      ) {
        return parts[2];
      }
    }

    if (error.source?.parameter) {
      return error.source.parameter;
    }

    return "general";
  }

  private static getErrorText(error: {
    detail?: string;
    title?: string;
    code?: string;
  }): string {
    return error.detail || error.title || error.code || "An error occurred";
  }

  constructor({
    errors,
    status,
  }: {
    errors: Array<{
      detail?: string;
      title?: string;
      status?: string;
      code?: string;
      source?: { parameter?: string; pointer?: string };
    }>;
    status?: number | null;
  }) {
    super(mockGetErrorMessage(errors));
    this.name = "ApiError";
    this.status = status ?? mockGetErrorStatus(errors);
    this.raw = errors;
    this.errors = {};

    errors.forEach((error) => {
      const key = mockApiError.getErrorKey(error);

      this.errors[key] ??= [];
      this.errors[key].push(mockApiError.getErrorText(error));
    });
  }

  hasStatus(...statuses: number[]) {
    return this.status !== null && statuses.includes(this.status);
  }
};

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
  createQueryCodec: () => ({
    parse: jest.fn(),
    stringify: jest.fn(),
    toHref: jest.fn(),
  }),
  getTodos: getTodosMock,
  getTodosId: getTodosIdMock,
  getTodosQueryParamsSchema: {
    parse: parseQueryMock,
  },
  isApiError: (error: unknown) => error instanceof mockApiError,
  postTodos: postTodosMock,
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
    getTodosIdMock.mockReset();
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

    const { fetchTodos } = await import("~/features/todos/query");
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

    const { fetchTodos } = await import("~/features/todos/query");
    await fetchTodos("board-1");

    expect(parseQueryMock).toHaveBeenCalledWith(validatedQuery);
    expect(getTodosMock).toHaveBeenCalledWith(validatedQuery, {});
  });

  test("fetchTodo loads a single todo with auth config", async () => {
    configMock.mockResolvedValue({
      headers: { Authorization: "Bearer token" },
    });
    getTodosIdMock.mockResolvedValue({
      data: { id: "todo-1" },
    });

    const { fetchTodo } = await import("~/features/todos/query");
    const todo = await fetchTodo("todo-1");

    expect(getTodosIdMock).toHaveBeenCalledWith("todo-1", undefined, {
      headers: { Authorization: "Bearer token" },
    });
    expect(todo).toEqual({ id: "todo-1" });
  });

  test("fetchTodo returns null when the todo is missing", async () => {
    configMock.mockResolvedValue({});
    getTodosIdMock.mockResolvedValue({
      data: null,
    });

    const { fetchTodo } = await import("~/features/todos/query");
    const todo = await fetchTodo("todo-1");

    expect(todo).toBeNull();
  });

  test("fetchTodo returns null for validation failures on detail lookup", async () => {
    configMock.mockResolvedValue({});
    getTodosIdMock.mockRejectedValue(
      new mockApiError({
        errors: [{ detail: "Todo id is invalid", status: "422" }],
      }),
    );

    const { fetchTodo } = await import("~/features/todos/query");
    const todo = await fetchTodo("todo-1");

    expect(todo).toBeNull();
  });

  test("fetchTodo rethrows unexpected transport failures", async () => {
    const error = new Error("socket hang up");

    configMock.mockResolvedValue({});
    getTodosIdMock.mockRejectedValue(error);

    const { fetchTodo } = await import("~/features/todos/query");

    await expect(fetchTodo("todo-1")).rejects.toThrow(error);
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

    const { createTodo } = await import("~/features/todos/mutations");
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

  test("maps validation errors from the API", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({});

    postTodosMock.mockRejectedValue(
      new mockApiError({
        errors: [
          {
            detail: "is required",
            status: "422",
            source: { pointer: "/data/attributes/title" },
          },
        ],
      }),
    );

    const formData = new FormData();
    formData.set("boardId", "board-1");
    formData.set("title", "");
    formData.set("content", "Ship board sharing");
    formData.set("priority", "high");
    formData.set("status", "backlog");

    const { createTodo } = await import("~/features/todos/mutations");
    const result = await createTodo({}, formData);

    expect(result).toEqual({
      errors: {
        title: ["is required"],
      },
    });
  });

  test("keeps all json:api errors without a client field whitelist", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({});

    postTodosMock.mockRejectedValue(
      new mockApiError({
        errors: [
          {
            detail: "Editing secret powers is not authorized on Sundays.",
            status: "403",
            source: { pointer: "/data/attributes/secretPowers" },
          },
          {
            detail: "Volume does not, in fact, go to 11.",
            status: "422",
            source: { pointer: "/data/attributes/volume" },
          },
          {
            detail: "Reputation service not responding after three requests.",
            status: "500",
            title: "The backend responded with an error",
            source: { pointer: "/data/attributes/reputation" },
          },
          {
            detail: "Board is invalid.",
            status: "422",
            source: { parameter: "boardId" },
          },
        ],
      }),
    );

    const formData = new FormData();
    formData.set("boardId", "board-1");
    formData.set("title", "Roadmap");
    formData.set("content", "Ship board sharing");
    formData.set("priority", "high");
    formData.set("status", "backlog");

    const { createTodo } = await import("~/features/todos/mutations");
    const result = await createTodo({}, formData);

    expect(result).toEqual({
      errors: {
        secretPowers: ["Editing secret powers is not authorized on Sundays."],
        volume: ["Volume does not, in fact, go to 11."],
        reputation: ["Reputation service not responding after three requests."],
        boardId: ["Board is invalid."],
      },
    });
  });

  test("fetchTodos throws when the API returns an error document", async () => {
    configMock.mockResolvedValue({});
    parseQueryMock.mockReturnValue({
      filter: {
        board_id: { eq: "board-1" },
      },
    });
    getTodosMock.mockRejectedValue(
      new mockApiError({
        errors: [{ detail: "Failed to load todos", status: "500" }],
      }),
    );

    const { fetchTodos } = await import("~/features/todos/query");

    await expect(fetchTodos("board-1")).rejects.toBeInstanceOf(mockApiError);
    await expect(fetchTodos("board-1")).rejects.toThrow("Failed to load todos");
  });
});
