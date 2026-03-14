/** @jest-environment node */

import { describe, expect, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("~/app/todos/[boardId]/_components/filter-tasks", () => ({
  FilterTasks: () => <div data-testid="filter-tasks">Filter tasks</div>,
}));

jest.mock("~/app/todos/[boardId]/_components/board-visibility-toggle", () => ({
  BoardVisibilityToggle: ({
    id,
    visibility,
  }: {
    id: string;
    visibility?: string;
  }) => (
    <div
      data-testid="board-visibility-toggle"
      data-board-id={id}
      data-board-visibility={visibility}
    >
      Board visibility toggle
    </div>
  ),
}));

describe("ControlPanel", () => {
  test("renders the create button and filter tasks control", async () => {
    const { ControlPanel } =
      await import("~/app/todos/[boardId]/_components/control-panel");
    const element = ControlPanel({
      boardId: "board-1",
      boardVisibility: "public",
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("filter-tasks");
    expect(html).toContain("Filter tasks");
    expect(html).toContain("Create task");
    expect(html).toContain("/todo/create?boardId=board-1");
    expect(html).toContain('data-board-id="board-1"');
    expect(html).toContain('data-board-visibility="public"');
    expect(html).toContain("Board visibility toggle");
  });

  test("omits board controls reserved for the owner when the board is read-only", async () => {
    const { ControlPanel } =
      await import("~/app/todos/[boardId]/_components/control-panel");
    const element = ControlPanel({
      boardId: "board-1",
      boardVisibility: "private",
      canCreate: false,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("filter-tasks");
    expect(html).not.toContain("Create task");
    expect(html).not.toContain("Board visibility toggle");
  });
});
