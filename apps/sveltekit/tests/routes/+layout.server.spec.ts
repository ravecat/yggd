import { beforeEach, describe, expect, it, vi } from "vitest";

const env: Record<string, string | undefined> = {
  NEXTJS_APP_URL: undefined,
  SVELTEKIT_APP_URL: "https://sveltekit.example.com",
  PREACT_APP_URL: undefined,
};

vi.mock("$env/dynamic/private", () => ({ env }));

describe("src/routes/+layout.server.ts", () => {
  beforeEach(() => {
    env.NEXTJS_APP_URL = undefined;
    env.SVELTEKIT_APP_URL = "https://sveltekit.example.com";
    env.PREACT_APP_URL = undefined;
  });

  it("builds framework links from implementation-specific env vars", async () => {
    env.NEXTJS_APP_URL = "https://nextjs.example.com";

    const { load } = await import("../../src/routes/+layout.server");

    expect(load({} as Parameters<typeof load>[0])).toEqual({
      frameworks: [
        {
          id: "nextjs",
          label: "Next.js",
          href: "https://nextjs.example.com",
        },
        {
          id: "sveltekit",
          label: "SvelteKit",
          href: "https://sveltekit.example.com",
        },
      ],
    });
  });
});
