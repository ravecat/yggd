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

    const button = screen.getByRole("button", {
      name: "Private board",
    });

    expect(button.getAttribute("aria-pressed")).toBe("false");

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(updateBoardVisibilityMock).toHaveBeenCalledWith("board-1", "public");
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", {
        name: "Public board",
      }),
    ).toHaveProperty("ariaPressed", "true");
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

    const button = screen.getByRole("button", {
      name: "Public board",
    });

    expect(button.getAttribute("aria-pressed")).toBe("true");

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(updateBoardVisibilityMock).toHaveBeenCalledWith(
      "board-1",
      "private",
    );
    expect(refreshMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", {
        name: "Public board",
      }),
    ).toHaveProperty("ariaPressed", "true");
  });
});
