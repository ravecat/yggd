/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { otelKeyValueSchema } from "./otelKeyValueSchema.js";

export const otelNumberDataPointSchema = z.object({
  timeUnixNano: z.string(),
  asDouble: z.number().optional(),
  asInt: z.string().optional(),
  attributes: z.array(otelKeyValueSchema).optional(),
});
