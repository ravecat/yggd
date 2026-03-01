/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { otelKeyValueSchema } from "./otelKeyValueSchema.js";
import { otelMetricSchema } from "./otelMetricSchema.js";

export const otelResourceMetricsSchema = z.object({
  resource: z.object({
    attributes: z.array(otelKeyValueSchema).optional(),
  }),
  scopeMetrics: z.array(
    z.object({
      scope: z
        .object({
          name: z.string().optional(),
          version: z.string().optional(),
        })
        .optional(),
      metrics: z.array(otelMetricSchema).optional(),
    }),
  ),
});
