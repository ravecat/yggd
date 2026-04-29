/** @jest-environment node */

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

const headersMock = jest.fn(async () => new Headers({ host: "localhost:3000" }));

jest.mock("next/headers", () => ({
  headers: headersMock,
}));

jest.mock("lucide-react", () => ({
  Check: () => <span data-check="true" />,
  ChevronsUpDown: () => null,
}));

jest.mock("~/shared/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button data-current="true">{children}</button>
  ),
}));

jest.mock("~/shared/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Switcher", () => {
  beforeEach(() => {
    headersMock.mockReset();
    headersMock.mockResolvedValue(new Headers({ host: "localhost:3000" }));
    process.env.NEXTJS_APP_URL = "http://localhost:3000";
    delete process.env.SVELTEKIT_APP_URL;
    delete process.env.PREACT_APP_URL;
  });

  test("reads framework links from runtime env", async () => {
    process.env.NEXTJS_APP_URL = "https://nextjs.example.com";
    process.env.SVELTEKIT_APP_URL = "https://sveltekit.example.com";
    process.env.PREACT_APP_URL = "https://preact.example.com";
    headersMock.mockResolvedValue(new Headers({ host: "sveltekit.example.com" }));

    const { Switcher } = await import("~/app/_components/switcher");
    const html = renderToStaticMarkup(await Switcher());

    expect(headersMock).toHaveBeenCalledTimes(1);
    expect(html).toContain('href="https://nextjs.example.com"');
    expect(html).toContain('href="https://sveltekit.example.com"');
    expect(html).toContain('href="https://preact.example.com"');
    expect(html).toContain('<button data-current="true">sveltekit</button>');
    expect(html).toContain('data-check="true"');
  });

  test("uses NEXTJS_APP_URL for the Next.js entry", async () => {
    const { Switcher } = await import("~/app/_components/switcher");
    const html = renderToStaticMarkup(await Switcher());

    expect(html).toContain('href="http://localhost:3000"');
    expect(html).toContain('<button data-current="true">nextjs</button>');
  });
});
