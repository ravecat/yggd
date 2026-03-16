import { render, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import TodosPage from "../../../src/routes/todos/+page.svelte";

const { page } = vi.hoisted(() => ({
  page: {
    url: new URL("http://localhost/todos"),
  },
}));

vi.mock("$app/state", () => ({ page }));

describe("src/routes/todos/+page.svelte", () => {
  it("renders the current pathname", () => {
    page.url = new URL("http://localhost/todos");
    render(TodosPage);

    expect(screen.getByText("/todos")).toBeTruthy();
  });
});
