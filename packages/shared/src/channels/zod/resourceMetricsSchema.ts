/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { keyValueSchema } from "./keyValueSchema.js";
import { metricSchema } from "./metricSchema.js";

export const resourceMetricsSchema = z.object({
  resource: z.object({
    attributes: z.array(keyValueSchema).optional(),
  }),
  scopeMetrics: z.array(
    z.object({
      scope: z
        .object({
          name: z.string().optional(),
          version: z.string().optional(),
        })
        .optional(),
      metrics: z.array(metricSchema).optional(),
    }),
  ),
});
