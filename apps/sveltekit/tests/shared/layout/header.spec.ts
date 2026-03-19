import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import Header from "../../../src/shared/layout/header.svelte";

const { page } = vi.hoisted(() => ({
  page: {
    url: new URL("http://localhost/"),
    route: {
      id: "/" as string | null,
    },
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
      href: "https://sveltekit.example.com",
    },
  ];
}

describe("src/shared/layout/header.svelte", () => {
  it("marks the active tab from the current pathname", () => {
    page.url = new URL("http://localhost/telemetry");
    page.route.id = "/telemetry";
    render(Header, { frameworks: createFrameworks() });

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const telemetryTab = within(navigation).getByRole("tab", {
      name: "Telemetry",
    });
    const todoTab = within(navigation).getByRole("tab", { name: "Todo" });

    expect(telemetryTab.getAttribute("aria-current")).toBe("page");
    expect(todoTab.getAttribute("aria-current")).toBeNull();
  });

  it("marks the active tab from the current route id", () => {
    page.url = new URL("http://localhost/chart");
    page.route.id = "/chart";
    render(Header, { frameworks: createFrameworks() });

    const navigation = screen.getByRole("navigation", { name: "Primary" });
    const chartTab = within(navigation).getByRole("tab", {
      name: "Chart",
    });
    const canvasTab = within(navigation).getByRole("tab", {
      name: "Canvas",
    });

    expect(chartTab.getAttribute("aria-current")).toBe("page");
    expect(canvasTab.getAttribute("aria-current")).toBeNull();
  });

  it("renders the framework switcher, sign-in button, and theme toggle", async () => {
    page.url = new URL("http://localhost/todos");
    page.route.id = "/todos";
    render(Header, { frameworks: createFrameworks() });

    expect(screen.getByRole("button", { name: "SvelteKit" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Sign in with Google/i }),
    ).toBeTruthy();
    expect(await screen.findByRole("button", { name: /theme/i })).toBeTruthy();
  });
});
