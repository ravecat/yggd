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

describe("ControlPanel", () => {
  test("renders the create button and static filter input", async () => {
    const { ControlPanel } = await import("./control-panel");
    const element = ControlPanel();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('type="search"');
    expect(html).toContain("Filter tasks");
    expect(html).toContain("Create task");
  });
});
