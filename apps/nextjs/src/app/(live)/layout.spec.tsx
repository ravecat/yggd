/** @jest-environment node */

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Suspense } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const connectionMock = jest.fn(async () => undefined);

jest.mock("next/server", () => ({
  connection: connectionMock,
}));

jest.mock("./_components/live-socket-provider", () => ({
  LiveSocketProvider: ({
    children,
    url,
  }: {
    children: React.ReactNode;
    url: string;
  }) => <div data-socket-url={url}>{children}</div>,
}));

describe("LiveLayout", () => {
  beforeEach(() => {
    jest.resetModules();
    connectionMock.mockClear();
    process.env.PUBLIC_CHANNEL_URL = "wss://channel.example.com/socket";
  });

  test("wraps the runtime env reader in Suspense", async () => {
    const { default: LiveLayout } = await import("./layout");
    const element = LiveLayout({
      children: <div>Content</div>,
    });

    expect(element.type).toBe(Suspense);
  });

  test("reads runtime channel URL and passes it to the socket provider", async () => {
    const { LiveLayoutContent } = await import("./layout");
    const element = await LiveLayoutContent({
      children: <div>Content</div>,
    });
    const html = renderToStaticMarkup(element);

    expect(connectionMock).toHaveBeenCalledTimes(1);
    expect(html).toContain(
      'data-socket-url="wss://channel.example.com/socket"',
    );
    expect(html).toContain("Content");
  });
});
