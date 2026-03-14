import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const patchBoardsIdMock = jest.fn();
const assignsMock = jest.fn();
const configMock = jest.fn();
const revalidatePathMock = jest.fn();
const mockApiError = class ApiError extends Error {
  readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = "Request failed") {
    super(message);
    this.name = "ApiError";
    this.errors = errors;
  }
};

jest.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

jest.mock("~/shared/lib/api", () => ({
  config: configMock,
}));

jest.mock("~/shared/lib/session", () => ({
  assigns: assignsMock,
}));

jest.mock("@rvct/shared", () => ({
  isApiError: (error: unknown) => error instanceof mockApiError,
  patchBoardsId: patchBoardsIdMock,
}));

describe("updateBoardVisibility", () => {
  beforeEach(() => {
    patchBoardsIdMock.mockReset();
    assignsMock.mockReset();
    configMock.mockReset();
    revalidatePathMock.mockReset();
  });

  test("updates the board visibility and revalidates the board page", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({
      headers: { Authorization: "Bearer token" },
    });
    patchBoardsIdMock.mockResolvedValue({ data: { id: "board-1" } });

    const { updateBoardVisibility } =
      await import("~/features/boards/mutations");
    const result = await updateBoardVisibility("board-1", "public");

    expect(patchBoardsIdMock).toHaveBeenCalledWith(
      "board-1",
      {
        data: {
          id: "board-1",
          type: "board",
          attributes: {
            visibility: "public",
          },
        },
      },
      undefined,
      {
        headers: { Authorization: "Bearer token" },
      },
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/todos/board-1");
    expect(result).toEqual({ visibility: "public" });
  });

  test("returns an auth error when there is no session", async () => {
    assignsMock.mockResolvedValue({ userId: null });
    configMock.mockResolvedValue({});

    const { updateBoardVisibility } =
      await import("~/features/boards/mutations");
    const result = await updateBoardVisibility("board-1", "private");

    expect(patchBoardsIdMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      errors: {
        general: ["Not authenticated"],
      },
    });
  });

  test("maps json:api validation errors from the backend", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({});
    patchBoardsIdMock.mockRejectedValue(
      new mockApiError({
        visibility: ["Visibility is invalid."],
      }),
    );

    const { updateBoardVisibility } =
      await import("~/features/boards/mutations");
    const result = await updateBoardVisibility("board-1", "public");

    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      errors: {
        visibility: ["Visibility is invalid."],
      },
    });
  });

  test("returns a generic error for unexpected failures", async () => {
    assignsMock.mockResolvedValue({ userId: "user-1" });
    configMock.mockResolvedValue({});
    patchBoardsIdMock.mockRejectedValue(new Error("socket hang up"));

    const { updateBoardVisibility } =
      await import("~/features/boards/mutations");
    const result = await updateBoardVisibility("board-1", "private");

    expect(result).toEqual({
      errors: {
        general: ["Failed to update board visibility"],
      },
    });
  });
});
