/** @jest-environment node */

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

const connectionMock = jest.fn(async () => undefined);

jest.mock("next/server", () => ({
  connection: connectionMock,
}));

describe("Footer", () => {
  beforeEach(() => {
    jest.resetModules();
    connectionMock.mockClear();
    process.env.PUBLIC_API_URL = "https://api.example.com";
  });

  test("renders API links from runtime env", async () => {
    const { Footer } = await import("~/components/footer");
    const html = renderToStaticMarkup(await Footer());

    expect(connectionMock).toHaveBeenCalledTimes(1);
    expect(html).toContain('href="https://api.example.com/openapi/ui"');
    expect(html).toContain('href="https://api.example.com/openapi"');
    expect(html).toContain('href="https://api.example.com/asyncapi/ui"');
    expect(html).toContain('href="https://api.example.com/asyncapi"');
  });
});
