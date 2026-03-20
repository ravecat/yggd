/** @jest-environment node */

import { describe, expect, jest, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

const switcherMock = jest.fn(() => <div>Switcher</div>);

jest.mock("~/app/_components/navbar", () => ({
  Navbar: () => <div>Navbar</div>,
  NavbarFallback: () => <div>Navbar fallback</div>,
}));

jest.mock("~/app/_components/switcher", () => ({
  Switcher: () => switcherMock(),
}));

jest.mock("~/app/_components/theme-toggle", () => ({
  ThemeToggle: () => <div>ThemeToggle</div>,
}));

jest.mock("~/components/sign-in", () => ({
  SignIn: () => <div>SignIn</div>,
  SignInFallback: () => <div>SignIn fallback</div>,
}));

describe("Header", () => {
  test("renders switcher, navigation, sign-in, and theme sections", async () => {
    const { Header } = await import("~/app/_components/header");
    const html = renderToStaticMarkup(<Header />);

    expect(switcherMock).toHaveBeenCalledTimes(1);
    expect(html).toContain("Switcher");
    expect(html).toContain("Navbar");
    expect(html).toContain("SignIn");
    expect(html).toContain("ThemeToggle");
  });
});
