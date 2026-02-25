/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";
import { dataPointSchema } from "./dataPointSchema.js";

export const metricSchema = z.object({
  name: z.string(),
  unit: z.string().optional(),
  gauge: z.object({
    dataPoints: z.array(dataPointSchema).optional(),
  }),
});
