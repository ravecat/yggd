import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Page from "../src/routes/+page.svelte";

describe("+page", () => {
  it("renders without page copy", () => {
    render(Page);

    expect(screen.queryByRole("heading")).toBeNull();
  });
});
