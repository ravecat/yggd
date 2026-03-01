/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { otelNumberDataPointSchema } from "./otelNumberDataPointSchema.js";

export const otelMetricSchema = z.object({
  name: z.string(),
  unit: z.string().optional(),
  gauge: z.object({
    dataPoints: z.array(otelNumberDataPointSchema).optional(),
  }),
});
