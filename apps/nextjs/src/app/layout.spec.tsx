/** @jest-environment node */

import { beforeEach, describe, expect, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("../components/footer", () => ({
  Footer: () => <footer>Footer</footer>,
  FooterFallback: () => <footer>Footer fallback</footer>,
}));

jest.mock("~/app/_components/navbar", () => ({
  Navbar: () => <nav>Navbar</nav>,
}));

describe("Layout", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("renders page content without runtime env script injection", async () => {
    const { default: Layout } = await import("./layout");
    const element = await Layout({
      children: <div>Content</div>,
      modal: <div>Modal</div>,
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("window.__ENV__=");
    expect(html).not.toContain("dangerouslySetInnerHTML");
    expect(html).toContain("Content");
  });
});
