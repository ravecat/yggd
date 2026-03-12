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

jest.mock("./filter-tasks", () => ({
  FilterTasks: () => <div data-testid="filter-tasks">Filter tasks</div>,
}));

describe("ControlPanel", () => {
  test("renders the create button and filter tasks control", async () => {
    const { ControlPanel } = await import("./control-panel");
    const element = ControlPanel({ boardId: "board-1" });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("filter-tasks");
    expect(html).toContain("Filter tasks");
    expect(html).toContain("Create task");
    expect(html).toContain("/todo/create?boardId=board-1");
  });

  test("omits the create button when the board is read-only", async () => {
    const { ControlPanel } = await import("./control-panel");
    const element = ControlPanel({ boardId: "board-1", canCreate: false });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("filter-tasks");
    expect(html).not.toContain("Create task");
  });
});
