/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const telemetryMetricPoint = z
  .object({
    name: z.string().describe("Metric name used for chart routing and widget identity."),
    unit: z
      .string()
      .describe("Unit string used for display formatting. Empty for dimensionless metrics."),
    tsUnixSec: z.number().describe("Unix timestamp in seconds as a JS-safe numeric value."),
    series: z
      .array(
        z.object({
          key: z.string().describe("Series key (for example value, p50, p95)."),
          value: z.number().describe("Numeric value for the series at tsUnixSec."),
        }),
      )
      .min(1),
  })
  .describe(
    "Chart-ready telemetry payload used by frontend clients. This shape is\na UI projection and does not expose OTLP datapoint internals.\n",
  );
