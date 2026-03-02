/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { telemetrySeriesPointSchema } from "./telemetrySeriesPointSchema.js";

export const telemetryMetricPointSchema = z.object({
  name: z.string(),
  unit: z.string(),
  tsUnixSec: z.number(),
  series: z.array(telemetrySeriesPointSchema),
});
