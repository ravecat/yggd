import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import HomePage from "../../src/routes/+page.svelte";

describe("src/routes/+page.svelte", () => {
  it("renders the fake dashboard grid and last update block", () => {
    render(HomePage);

    expect(screen.getAllByRole("article")).toHaveLength(9);
    expect(screen.getByText("Visitors")).toBeTruthy();
    expect(screen.getByText("Response Time")).toBeTruthy();
    expect(screen.getByText("Requests")).toBeTruthy();
    expect(screen.getByText("Error Rate")).toBeTruthy();
    expect(screen.getByText("Bandwidth")).toBeTruthy();
    expect(screen.queryByText("Heat Index")).toBeNull();
    expect(
      screen.getByRole("complementary", { name: "Last update" }),
    ).toBeTruthy();
    expect(screen.getByText("mock data")).toBeTruthy();
  });
});
