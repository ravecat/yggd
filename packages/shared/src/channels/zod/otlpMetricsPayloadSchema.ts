/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { resourceMetricsSchema } from "./resourceMetricsSchema.js";

export const otlpMetricsPayloadSchema = z.object({
  resourceMetrics: z.array(resourceMetricsSchema),
});
