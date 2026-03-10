/** @jest-environment node */

import { afterEach, describe, expect, test } from "@jest/globals";

const originalWindow = globalThis.window;
const originalEnv = { ...process.env };

async function importEnvModule() {
  jest.resetModules();
  return import("./env");
}

afterEach(() => {
  process.env = { ...originalEnv };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
    writable: true,
  });
});

describe("env", () => {
  test("reads env from process.env on the server", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    process.env.PUBLIC_API_URL = "https://api.example.com";
    process.env.APP_URL = "https://app.example.com";
    process.env.PUBLIC_CHANNEL_URL = "wss://channel.example.com/socket";

    const { env } = await importEnvModule();

    expect(env).toEqual({
      APP_URL: "https://app.example.com",
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_CHANNEL_URL: "wss://channel.example.com/socket",
    });
  });

  test("removes a trailing slash from all URL env vars on the server", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    process.env.PUBLIC_API_URL = "https://api.example.com/";
    process.env.APP_URL = "https://app.example.com/";
    process.env.PUBLIC_CHANNEL_URL = "wss://channel.example.com/socket/";

    const { env } = await importEnvModule();

    expect(env).toEqual({
      APP_URL: "https://app.example.com",
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_CHANNEL_URL: "wss://channel.example.com/socket",
    });
  });

  test("exports window.__ENV__ as env", async () => {
    const runtimeEnv = {
      APP_URL: "https://app.example.com",
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_CHANNEL_URL: "wss://channel.example.com/socket",
    };

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { __ENV__: runtimeEnv },
      writable: true,
    });

    const { env } = await importEnvModule();

    expect(env).toEqual(runtimeEnv);
  });

  test("removes a trailing slash from all URL env vars on the client", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        __ENV__: {
          APP_URL: "https://app.example.com/",
          PUBLIC_API_URL: "https://api.example.com/",
          PUBLIC_CHANNEL_URL: "wss://channel.example.com/socket/",
        },
      },
      writable: true,
    });

    const { env } = await importEnvModule();

    expect(env).toEqual({
      APP_URL: "https://app.example.com",
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_CHANNEL_URL: "wss://channel.example.com/socket",
    });
  });

  test("falls back to empty strings when env vars are missing", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    delete process.env.PUBLIC_API_URL;
    delete process.env.APP_URL;
    delete process.env.PUBLIC_CHANNEL_URL;

    const { env } = await importEnvModule();

    expect(env).toEqual({
      APP_URL: "",
      PUBLIC_API_URL: "",
      PUBLIC_CHANNEL_URL: "",
    });
  });

  test("fills missing client env values with empty strings", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        __ENV__: {
          PUBLIC_API_URL: "https://api.example.com",
        },
      },
      writable: true,
    });

    const { env } = await importEnvModule();

    expect(env).toEqual({
      APP_URL: "",
      PUBLIC_API_URL: "https://api.example.com",
      PUBLIC_CHANNEL_URL: "",
    });
  });

  test("serializes runtime env for inline script injection", async () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    process.env.PUBLIC_API_URL = "https://api.example.com";
    process.env.APP_URL =
      'https://app.example.com/?q=</script><script>alert("x")</script>';
    process.env.PUBLIC_CHANNEL_URL = "wss://channel.example.com/socket";

    const { getRuntimeEnvScript } = await importEnvModule();
    const script = getRuntimeEnvScript();

    expect(script).toContain("window.__ENV__=");
    expect(script).toContain("\\u003c/script>");
    expect(script).not.toContain("</script>");
  });
});
