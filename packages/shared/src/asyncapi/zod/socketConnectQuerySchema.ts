/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const socketConnectQuery = z
  .object({
    vsn: z.literal("2.0.0").describe("Phoenix serializer version"),
    token: z
      .string()
      .describe("Optional auth token for socket connect")
      .optional(),
  })
  .catchall(z.unknown());
