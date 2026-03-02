/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const otelNumberDataPoint = z
  .object({
    timeUnixNano: z
      .string()
      .describe("Timestamp as nanoseconds since Unix epoch, encoded as string"),
    asDouble: z.number().describe("Floating-point metric value").optional(),
    asInt: z
      .string()
      .describe("Integer metric value, encoded as string per OTLP convention")
      .optional(),
    attributes: z
      .array(
        z
          .object({
            key: z.string(),
            value: z
              .object({
                stringValue: z.string().optional(),
                intValue: z.string().optional(),
                doubleValue: z.number().optional(),
                boolValue: z.boolean().optional(),
              })
              .describe(
                "Typed value (stringValue, intValue, doubleValue, boolValue)",
              ),
          })
          .describe("OTel key-value attribute pair"),
      )
      .optional(),
  })
  .describe("A single data point within a metric");
