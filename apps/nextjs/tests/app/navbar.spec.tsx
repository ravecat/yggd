/** @jest-environment node */

import { describe, expect, jest, test } from "@jest/globals";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/navigation", () => ({
  usePathname: () => "/todos",
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("~/shared/ui/tabs", () => {
  const React = require("react");

  return {
    Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ asChild, children, ...props }: { asChild?: boolean; children: ReactNode }) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, props);
      }

      return <button {...props}>{children}</button>;
    },
  };
});

describe("Navbar", () => {
  test("renders the Tasks tab as the active navigation item for todo routes", async () => {
    const { Navbar } = await import("~/app/_components/navbar");
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain(">Tasks<");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="/todos"');
  });
});
