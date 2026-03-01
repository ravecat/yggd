/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { otelResourceMetricsSchema } from "./otelResourceMetricsSchema.js";

export const otelExportMetricsServiceRequestSchema = z.object({
  resourceMetrics: z.array(otelResourceMetricsSchema),
});
