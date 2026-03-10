/** @jest-environment node */

import { beforeEach, describe, expect, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("../components/footer", () => ({
  Footer: () => <footer>Footer</footer>,
}));

jest.mock("~/app/_components/navbar", () => ({
  Navbar: () => <nav>Navbar</nav>,
}));

describe("Layout", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.PUBLIC_API_URL = "https://api.example.com";
    process.env.APP_URL = "https://app.example.com";
    process.env.PUBLIC_CHANNEL_URL = "wss://channel.example.com/socket";
  });

  test("injects runtime env before the page content", async () => {
    const { default: Layout } = await import("./layout");
    const element = await Layout({
      children: <div>Content</div>,
      modal: <div>Modal</div>,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain(
      '<script>window.__ENV__={"PUBLIC_API_URL":"https://api.example.com","APP_URL":"https://app.example.com","PUBLIC_CHANNEL_URL":"wss://channel.example.com/socket"};</script>',
    );
    expect(html.indexOf("<script>window.__ENV__=")).toBeLessThan(
      html.indexOf("Content"),
    );
  });
});
