import { describe, expect, it } from "vitest";

describe("src/routes/+page.server.ts", () => {
  it("redirects root requests to /todos", async () => {
    const { load } = await import("../../src/routes/+page.server");

    try {
      await load({} as Parameters<typeof load>[0]);
      throw new Error("Expected root route to redirect");
    } catch (error) {
      expect(error).toMatchObject({
        status: 307,
        location: "/todos",
      });
    }
  });
});
