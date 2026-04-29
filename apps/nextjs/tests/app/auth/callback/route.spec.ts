/** @jest-environment node */

import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const exchangeCodeForTokenMock = jest.fn();

jest.mock("~/features/auth", () => ({
  exchangeCodeForToken: exchangeCodeForTokenMock,
}));

describe("auth callback route", () => {
  beforeEach(() => {
    jest.resetModules();
    exchangeCodeForTokenMock.mockReset();
    exchangeCodeForTokenMock.mockResolvedValue("token");
    process.env.NEXTJS_APP_URL = "http://localhost:3000";
  });

  test("redirects callback success to NEXTJS_APP_URL", async () => {
    const { GET } = await import("~/app/auth/callback/route");
    const response = await GET({
      nextUrl: new URL("http://localhost:3000/auth/callback?code=abc"),
    } as never);

    expect(exchangeCodeForTokenMock).toHaveBeenCalledWith("abc");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  test("redirects callback errors to NEXTJS_APP_URL", async () => {
    const { GET } = await import("~/app/auth/callback/route");
    const response = await GET({
      nextUrl: new URL("http://localhost:3000/auth/callback?error=access_denied"),
    } as never);

    expect(exchangeCodeForTokenMock).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/?error=access_denied");
  });
});
