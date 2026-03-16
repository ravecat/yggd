import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ChartPage from "../../../src/routes/chart/+page.svelte";

describe("src/routes/chart/+page.svelte", () => {
  it("renders the chart pathname", () => {
    render(ChartPage);

    expect(screen.getByText("/chart")).toBeTruthy();
  });
});
