import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "../../../src/shared/layout/theme-toggle.svelte";

const THEME_STORAGE_KEY = "moda:theme";
const THEME_ATTRIBUTE = "data-theme";
const THEME_CONTROLLER_SCRIPT = readFileSync(
  resolve(process.cwd(), "src/app.html"),
  "utf8",
).match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];

if (!THEME_CONTROLLER_SCRIPT) {
  throw new Error("Theme controller script not found in src/app.html");
}

describe("src/shared/layout/theme-toggle.svelte", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    window.localStorage.clear();
  });

  it("toggles the document theme through the global app controller", async () => {
    render(ThemeToggle);
    window.eval(THEME_CONTROLLER_SCRIPT);

    const button = screen.getByRole("button", { name: "Toggle theme" });

    await fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
        "dark",
      );
    });

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
