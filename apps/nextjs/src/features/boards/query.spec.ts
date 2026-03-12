import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockGetBoards = jest.fn();
const mockGetBoardsId = jest.fn();
const mockAssigns = jest.fn();
const mockConfig = jest.fn();
const mockParseQuery = jest.fn();

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

    const { fetchCurrentBoard } = await import("./query");
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

    const { fetchCurrentBoard } = await import("./query");
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

    const { fetchBoard } = await import("./query");
    const board = await fetchBoard("board-1");

    expect(mockGetBoardsId).toHaveBeenCalledWith("board-1", undefined, {
      headers: { Authorization: "Bearer token" },
    });
    expect(board).toEqual({ id: "board-1" });
  });
});
