/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { keyValueSchema } from "./keyValueSchema.js";

export const dataPointSchema = z.object({
  timeUnixNano: z.string(),
  asDouble: z.number().optional(),
  asInt: z.string().optional(),
  attributes: z.array(keyValueSchema).optional(),
});
