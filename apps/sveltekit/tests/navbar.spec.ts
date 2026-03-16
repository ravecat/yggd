import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Navbar from "$shared/layout/navbar.svelte";

const { page } = vi.hoisted(() => ({
  page: {
    url: new URL("http://localhost/"),
  },
}));

vi.mock("$app/state", () => ({ page }));

function createFrameworks() {
  return [
    {
      id: "nextjs",
      label: "Next.js",
      href: "http://localhost:3000",
    },
    {
      id: "sveltekit",
      label: "SvelteKit",
      href: window.location.origin,
    },
  ];
}

function getCurrentFrameworkLabel() {
  return (
    createFrameworks().find(
      (framework) => new URL(framework.href).host === window.location.host,
    )?.label ?? "SvelteKit"
  );
}

describe("Navbar", () => {
  it("marks the active tab from the current pathname", () => {
    page.url = new URL("http://localhost/telemetry");
    render(Navbar, { frameworks: createFrameworks() });

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const telemetryTab = within(navigation).getByRole("tab", {
      name: "Telemetry",
    });
    const todoTab = within(navigation).getByRole("tab", { name: "Todo" });

    expect(telemetryTab.getAttribute("aria-current")).toBe("page");
    expect(todoTab.getAttribute("aria-current")).toBeNull();
  });

  it("renders the framework switcher and static sign-in button", () => {
    page.url = new URL("http://localhost/");
    render(Navbar, { frameworks: createFrameworks() });

    expect(
      screen.getByRole("button", { name: getCurrentFrameworkLabel() }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    ).toBeTruthy();
  });
});
