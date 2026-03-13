import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockGetBoards = jest.fn();
const mockGetBoardsId = jest.fn();
const mockAssigns = jest.fn();
const mockConfig = jest.fn();
const mockParseQuery = jest.fn();
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
  readonly errors: Array<{ detail?: string; title?: string; status?: string }>;

  constructor({
    errors,
    status,
    message,
  }: {
    errors: Array<{ detail?: string; title?: string; status?: string }>;
    status?: number | null;
    message?: string;
  }) {
    super(message ?? mockGetErrorMessage(errors));
    this.name = "ApiError";
    this.status = status ?? mockGetErrorStatus(errors);
    this.errors = errors;
  }

  hasStatus(...statuses: number[]) {
    return this.status !== null && statuses.includes(this.status);
  }
};

jest.mock("~/shared/lib/api", () => ({
  config: mockConfig,
}));

jest.mock("~/shared/lib/session", () => ({
  assigns: mockAssigns,
}));

jest.mock("@rvct/shared", () => ({
  getBoards: mockGetBoards,
  getBoardsId: mockGetBoardsId,
  getBoardsQueryParamsSchema: {
    parse: mockParseQuery,
  },
  isApiError: (error: unknown) => error instanceof mockApiError,
}));

describe("board queries", () => {
  beforeEach(() => {
    mockGetBoards.mockReset();
    mockGetBoardsId.mockReset();
    mockAssigns.mockReset();
    mockConfig.mockReset();
    mockParseQuery.mockReset();
  });

  test("fetchCurrentBoard loads the authenticated user's board", async () => {
    mockAssigns.mockResolvedValue({ userId: "user-1" });
    mockConfig.mockResolvedValue({
      headers: { Authorization: "Bearer token" },
    });
    mockParseQuery.mockReturnValue({
      page: {
        limit: 1,
      },
    });
    mockGetBoards.mockResolvedValue({
      data: [{ id: "board-1" }],
    });

    const { fetchCurrentBoard } = await import("~/features/boards/query");
    const board = await fetchCurrentBoard();

    expect(mockParseQuery).toHaveBeenCalledWith({
      page: {
        limit: 1,
      },
    });
    expect(mockGetBoards).toHaveBeenCalledWith(
      {
        page: {
          limit: 1,
        },
      },
      {
        headers: { Authorization: "Bearer token" },
      },
    );
    expect(board).toEqual({ id: "board-1" });
  });

  test("fetchCurrentBoard returns null when the user is not authenticated", async () => {
    mockAssigns.mockResolvedValue({ userId: null });

    const { fetchCurrentBoard } = await import("~/features/boards/query");
    const board = await fetchCurrentBoard();

    expect(board).toBeNull();
    expect(mockParseQuery).not.toHaveBeenCalled();
    expect(mockGetBoards).not.toHaveBeenCalled();
  });

  test("fetchBoard passes auth config through to the board lookup", async () => {
    mockConfig.mockResolvedValue({
      headers: { Authorization: "Bearer token" },
    });
    mockGetBoardsId.mockResolvedValue({
      data: { id: "board-1" },
    });

    const { fetchBoard } = await import("~/features/boards/query");
    const board = await fetchBoard("board-1");

    expect(mockGetBoardsId).toHaveBeenCalledWith("board-1", undefined, {
      headers: { Authorization: "Bearer token" },
    });
    expect(board).toEqual({ id: "board-1" });
  });

  test("fetchBoard returns null when the board is missing", async () => {
    mockConfig.mockResolvedValue({});
    mockGetBoardsId.mockResolvedValue({
      data: null,
    });

    const { fetchBoard } = await import("~/features/boards/query");
    const board = await fetchBoard("board-1");

    expect(board).toBeNull();
  });

  test("fetchBoard returns null for validation failures on detail lookup", async () => {
    mockConfig.mockResolvedValue({});
    mockGetBoardsId.mockRejectedValue(
      new mockApiError({
        errors: [{ detail: "Board id is invalid", status: "422" }],
      }),
    );

    const { fetchBoard } = await import("~/features/boards/query");
    const board = await fetchBoard("board-1");

    expect(board).toBeNull();
  });

  test("fetchBoard rethrows unexpected transport failures", async () => {
    const error = new Error("socket hang up");

    mockConfig.mockResolvedValue({});
    mockGetBoardsId.mockRejectedValue(error);

    const { fetchBoard } = await import("~/features/boards/query");

    await expect(fetchBoard("board-1")).rejects.toThrow(error);
  });

  test("fetchCurrentBoard throws when the API returns an error document", async () => {
    mockAssigns.mockResolvedValue({ userId: "user-1" });
    mockConfig.mockResolvedValue({});
    mockParseQuery.mockReturnValue({
      page: {
        limit: 1,
      },
    });
    mockGetBoards.mockRejectedValue(
      new mockApiError({
        errors: [{ detail: "Failed to load boards", status: "500" }],
      }),
    );

    const { fetchCurrentBoard } = await import("~/features/boards/query");

    await expect(fetchCurrentBoard()).rejects.toBeInstanceOf(mockApiError);
    await expect(fetchCurrentBoard()).rejects.toThrow("Failed to load boards");
  });
});
