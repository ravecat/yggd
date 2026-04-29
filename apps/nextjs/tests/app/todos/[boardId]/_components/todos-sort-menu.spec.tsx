import "@testing-library/jest-dom";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const replaceMock = jest.fn();
let currentSearchParams = new URLSearchParams("filter=roadmap");

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => "/todos/board-1",
  useSearchParams: () => currentSearchParams,
}));

jest.mock("~/shared/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

jest.mock("~/shared/ui/select", () => ({
  Select: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

describe("TodosSortMenu", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    currentSearchParams = new URLSearchParams("filter=roadmap");
  });

  test("adds a default sorting rule and applies it to the URL", async () => {
    const { TodosSortMenu } = await import("~/app/todos/[boardId]/_components/todos-sort-menu");

    render(<TodosSortMenu value="" />);

    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/todos/board-1?filter=roadmap&sort=-priority", {
        scroll: false,
      });
    });
  });

  test("removes an existing sorting rule while preserving other query params", async () => {
    const { TodosSortMenu } = await import("~/app/todos/[boardId]/_components/todos-sort-menu");

    render(<TodosSortMenu value="title" />);

    fireEvent.click(screen.getByRole("button", { name: "Remove Title sort rule" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/todos/board-1?filter=roadmap", {
        scroll: false,
      });
    });
  });
});
