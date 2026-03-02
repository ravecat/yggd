/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const chartJoinReplyPayload = z.object({
  status: z.literal("ok"),
  response: z.object({
    history: z
      .array(
        z
          .object({
            e: z.string().describe('Event type (always "24hrMiniTicker")'),
            E: z
              .number()
              .int()
              .describe("Event time in milliseconds since epoch"),
            s: z.string().describe('Symbol (e.g. "BTCUSDT", "ETHUSDT")'),
            c: z.string().describe("Close price (current price)"),
            o: z.string().describe("Open price (24h)"),
            h: z.string().describe("High price (24h)"),
            l: z.string().describe("Low price (24h)"),
            v: z.string().describe("Total traded base asset volume"),
            q: z.string().describe("Total traded quote asset volume"),
          })
          .describe(
            "Binance 24hr miniTicker event forwarded as-is.\nSee https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream\n",
          ),
      )
      .describe("Buffered price history (last 300 points, oldest first)"),
  }),
});
