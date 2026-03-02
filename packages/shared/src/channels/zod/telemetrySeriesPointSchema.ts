/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const telemetrySeriesPointSchema = z.object({
  key: z.string(),
  value: z.number(),
});
