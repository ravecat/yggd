/** @jest-environment node */

import { beforeEach, describe, expect, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("~/components/footer", () => ({
  Footer: () => <footer>Footer</footer>,
  FooterFallback: () => <footer>Footer fallback</footer>,
}));

jest.mock("~/app/_components/header", () => ({
  Header: () => <header>Header</header>,
}));

describe("Layout", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("renders page content with the root theme controller script", async () => {
    const { default: Layout } = await import("~/app/layout");
    const element = await Layout({
      children: <div>Content</div>,
      modal: <div>Modal</div>,
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("window.__ENV__=");
    expect(html).toContain("Content");
    expect(html).toContain("moda:theme");
    expect(html).toContain("moda:set-theme");
    expect(html).toContain("data-theme");
  });
});
