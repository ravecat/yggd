import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Page from "../src/routes/+page.svelte";

describe("+page", () => {
  it("renders the default heading", () => {
    render(Page);

    expect(
      screen.getByRole("heading", { name: "Welcome to SvelteKit" }),
    ).toBeTruthy();
  });
});
