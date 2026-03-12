import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Navbar from "$shared/layout/navbar.svelte";

describe("Navbar", () => {
  it("marks the active tab from the current pathname", () => {
    render(Navbar, { pathname: "/telemetry" });

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const telemetryTab = within(navigation).getByRole("tab", {
      name: "Telemetry",
    });
    const todoTab = within(navigation).getByRole("tab", { name: "Todo" });

    expect(telemetryTab.getAttribute("aria-current")).toBe("page");
    expect(todoTab.getAttribute("aria-current")).toBeNull();
  });

  it("renders the framework switcher and static sign-in button", () => {
    render(Navbar, { pathname: "/" });

    expect(screen.getByRole("button", { name: "SvelteKit" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    ).toBeTruthy();
  });
});
