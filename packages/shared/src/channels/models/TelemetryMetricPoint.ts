/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { TelemetrySeriesPoint } from "./TelemetrySeriesPoint.js";

export interface TelemetryMetricPoint {
  name: string;
  unit: string;
  tsUnixSec: number;
  series: TelemetrySeriesPoint[];
}
