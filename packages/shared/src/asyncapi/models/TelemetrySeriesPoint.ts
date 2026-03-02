/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

export interface TelemetrySeriesPoint {
  /**
   * Series key (for example value, p50, p95).
   */
  key: string;
  /**
   * Numeric value for the series at tsUnixSec.
   */
  value: number;
}
