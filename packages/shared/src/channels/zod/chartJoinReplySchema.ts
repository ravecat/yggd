/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { priceTickSchema } from "./priceTickSchema.js";

export const chartJoinReplySchema = z.object({
  status: z.literal("ok"),
  response: z.object({
    history: z.array(priceTickSchema),
  }),
});
