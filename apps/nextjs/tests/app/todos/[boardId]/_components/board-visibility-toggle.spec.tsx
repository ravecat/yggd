import { act } from "react";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

const refreshMock = jest.fn();
const updateBoardVisibilityMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

jest.mock("~/features/boards/mutations", () => ({
  updateBoardVisibility: updateBoardVisibilityMock,
}));

describe("BoardVisibilityToggle", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    updateBoardVisibilityMock.mockReset();
  });

  test("updates the board visibility", async () => {
    updateBoardVisibilityMock.mockResolvedValue({ visibility: "public" });

    const { BoardVisibilityToggle } =
      await import("~/app/todos/[boardId]/_components/board-visibility-toggle");

    render(<BoardVisibilityToggle id="board-1" visibility="private" />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Public",
    }) as HTMLInputElement;

    expect(checkbox.checked).toBe(false);

    await act(async () => {
      fireEvent.click(checkbox);
      await Promise.resolve();
    });

    expect(updateBoardVisibilityMock).toHaveBeenCalledWith("board-1", "public");
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(checkbox.checked).toBe(true);
  });

  test("restores the previous visibility when the update fails", async () => {
    updateBoardVisibilityMock.mockResolvedValue({
      errors: {
        visibility: ["Visibility is invalid."],
      },
    });

    const { BoardVisibilityToggle } =
      await import("~/app/todos/[boardId]/_components/board-visibility-toggle");

    render(<BoardVisibilityToggle id="board-1" visibility="public" />);

    const checkbox = screen.getByRole("checkbox", {
      name: "Public",
    }) as HTMLInputElement;

    expect(checkbox.checked).toBe(true);

    await act(async () => {
      fireEvent.click(checkbox);
      await Promise.resolve();
    });

    expect(updateBoardVisibilityMock).toHaveBeenCalledWith(
      "board-1",
      "private",
    );
    expect(refreshMock).not.toHaveBeenCalled();
    expect(checkbox.checked).toBe(true);
  });
});
