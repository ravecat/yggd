/** @jest-environment node */

import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const clearSessionMock = jest.fn();

jest.mock("~/shared/lib/session", () => ({
  clearSession: clearSessionMock,
}));

describe("auth signout route", () => {
  beforeEach(() => {
    clearSessionMock.mockReset();
    clearSessionMock.mockResolvedValue(undefined);
  });

  test("POST clears the auth cookie and returns a success payload", async () => {
    const { POST } = await import("./route");
    const response = await POST();

    expect(clearSessionMock).toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  test("GET clears the auth cookie and redirects home", async () => {
    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/auth/signout"));

    expect(clearSessionMock).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });
});
