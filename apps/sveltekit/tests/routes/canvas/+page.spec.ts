import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import CanvasPage from "../../../src/routes/canvas/+page.svelte";

const { page } = vi.hoisted(() => ({
  page: {
    url: new URL("http://localhost/canvas"),
  },
}));

vi.mock("$app/state", () => ({ page }));

describe("src/routes/canvas/+page.svelte", () => {
  it("renders the current pathname", () => {
    page.url = new URL("http://localhost/canvas");
    render(CanvasPage);

    expect(screen.getByText("/canvas")).toBeTruthy();
  });
});
