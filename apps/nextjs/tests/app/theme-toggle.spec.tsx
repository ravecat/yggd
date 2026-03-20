import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeToggle } from "~/app/_components/theme-toggle";

const THEME_ATTRIBUTE = "data-theme";
const THEME_STORAGE_KEY = "moda:theme";

jest.mock("~/components/footer", () => ({
  Footer: () => <footer>Footer</footer>,
  FooterFallback: () => <footer>Footer fallback</footer>,
}));

jest.mock("~/app/_components/header", () => ({
  Header: () => <header>Header</header>,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    window.localStorage.clear();
  });

  async function installThemeController() {
    const { default: Layout } = await import("~/app/layout");
    const html = renderToStaticMarkup(
      await Layout({
        children: <div>Content</div>,
        modal: null,
      }),
    );
    const match = html.match(/<script>([\s\S]*?)<\/script>/);

    if (!match) {
      throw new Error("Theme controller script not found in app layout");
    }

    window.eval(match[1]);
  }

  test("toggles the document theme through the root controller", async () => {
    await installThemeController();
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Toggle theme" });

    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
        "dark",
      );
    });

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
