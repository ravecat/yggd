/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

/**
 * A single metric in OTLP format. Contains name, unit, and one of
 * the metric type fields (gauge, sum, histogram, etc.).
 * This implementation uses gauge for all metrics including pre-aggregated
 * histogram percentiles.
 *
 */
export interface OtelMetric {
  /**
   * Metric name following OTel semantic conventions.
   * Examples: system.cpu.load_average.1m, process.runtime.beam.process_count
   *
   */
  name: string;
  /**
   * OTel unit string. Examples: "1" (dimensionless), "By" (bytes),
   * "ms" (milliseconds), "{process}" (count of processes)
   *
   */
  unit?: string;
  gauge: {
    dataPoints?: {
      /**
       * Timestamp as nanoseconds since Unix epoch, encoded as string
       */
      timeUnixNano: string;
      /**
       * Floating-point metric value
       */
      asDouble?: number;
      /**
       * Integer metric value, encoded as string per OTLP convention
       */
      asInt?: string;
      attributes?: {
        key: string;
        /**
         * Typed value (stringValue, intValue, doubleValue, boolValue)
         */
        value: {
          stringValue?: string;
          intValue?: string;
          doubleValue?: number;
          boolValue?: boolean;
        };
      }[];
    }[];
  };
}
