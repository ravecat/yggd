/** @jest-environment node */

import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const redirectMock = jest.fn();
const cookiesSetMock = jest.fn();
const cookiesGetMock = jest.fn();
const cookiesDeleteMock = jest.fn();
const generateCodeVerifierMock = jest.fn(() => "verifier");
const generateCodeChallengeMock = jest.fn(() => "challenge");
const clearSessionMock = jest.fn();
const setSessionMock = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

jest.mock("next/headers", () => ({
  cookies: async () => ({
    set: cookiesSetMock,
    get: cookiesGetMock,
    delete: cookiesDeleteMock,
  }),
}));

jest.mock("~/shared/lib/pkce", () => ({
  generateCodeVerifier: generateCodeVerifierMock,
  generateCodeChallenge: generateCodeChallengeMock,
}));

jest.mock("~/shared/lib/session", () => ({
  clearSession: clearSessionMock,
  setSession: setSessionMock,
}));

describe("auth feature", () => {
  beforeEach(() => {
    jest.resetModules();
    redirectMock.mockReset();
    cookiesSetMock.mockReset();
    cookiesGetMock.mockReset();
    cookiesDeleteMock.mockReset();
    generateCodeVerifierMock.mockClear();
    generateCodeChallengeMock.mockClear();
    clearSessionMock.mockReset();
    setSessionMock.mockReset();
    cookiesGetMock.mockReturnValue(undefined);
    clearSessionMock.mockResolvedValue(undefined);
    setSessionMock.mockResolvedValue(undefined);
    process.env.NEXTJS_APP_URL = "http://localhost:3000";
    process.env.PUBLIC_API_URL = "http://localhost:4000/api";
    process.env.AUTH_SERVICE_URL = "http://localhost:4000";
  });

  test("signup redirects to oauth with NEXTJS_APP_URL callback", async () => {
    const { signup } = await import("~/features/auth");

    await signup();

    expect(cookiesSetMock).toHaveBeenCalledWith(
      "pkce_verifier",
      "verifier",
      expect.objectContaining({
        httpOnly: true,
        maxAge: 600,
        path: "/",
        sameSite: "lax",
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith(
      "http://localhost:4000/auth/user/google?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&code_challenge=challenge&code_challenge_method=S256",
    );
  });

  test("signout clears the session and redirects home", async () => {
    const { signout } = await import("~/features/auth");

    await signout();

    expect(clearSessionMock).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
