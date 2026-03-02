/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const telemetrySeriesPoint = z.object({
  key: z.string().describe("Series key (for example value, p50, p95)."),
  value: z.number().describe("Numeric value for the series at tsUnixSec."),
});
