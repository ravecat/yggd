/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const socketConnectQuerySchema = z
  .object({
    vsn: z.literal("2.0.0"),
    token: z.string().optional(),
  })
  .passthrough();
