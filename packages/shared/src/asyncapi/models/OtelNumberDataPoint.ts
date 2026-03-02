/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

/**
 * A single data point within a metric
 */
export interface OtelNumberDataPoint {
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
}
