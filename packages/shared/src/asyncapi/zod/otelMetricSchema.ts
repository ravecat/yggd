/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import { z } from "zod/v4";

export const otelMetric = z
  .object({
    name: z
      .string()
      .describe(
        "Metric name following OTel semantic conventions.\nExamples: system.cpu.load_average.1m, process.runtime.beam.process_count\n",
      ),
    unit: z
      .string()
      .describe(
        'OTel unit string. Examples: "1" (dimensionless), "By" (bytes),\n"ms" (milliseconds), "{process}" (count of processes)\n',
      )
      .optional(),
    gauge: z.object({
      dataPoints: z
        .array(
          z
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
                        .describe("Typed value (stringValue, intValue, doubleValue, boolValue)"),
                    })
                    .describe("OTel key-value attribute pair"),
                )
                .optional(),
            })
            .describe("A single data point within a metric"),
        )
        .optional(),
    }),
  })
  .describe(
    "A single metric in OTLP format. Contains name, unit, and one of\nthe metric type fields (gauge, sum, histogram, etc.).\nThis implementation uses gauge for all metrics including pre-aggregated\nhistogram percentiles.\n",
  );
