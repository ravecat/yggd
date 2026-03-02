/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

/**
 * Chart-ready telemetry payload used by frontend clients. This shape is
 * a UI projection and does not expose OTLP datapoint internals.
 *
 */
export interface TelemetryMetricPoint {
  /**
   * Metric name used for chart routing and widget identity.
   */
  name: string;
  /**
   * Unit string used for display formatting. Empty for dimensionless metrics.
   */
  unit: string;
  /**
   * Unix timestamp in seconds as a JS-safe numeric value.
   */
  tsUnixSec: number;
  /**
   * @minItems 1
   */
  series: [
    {
      /**
       * Series key (for example value, p50, p95).
       */
      key: string;
      /**
       * Numeric value for the series at tsUnixSec.
       */
      value: number;
    },
    ...{
      /**
       * Series key (for example value, p50, p95).
       */
      key: string;
      /**
       * Numeric value for the series at tsUnixSec.
       */
      value: number;
    }[],
  ];
}
