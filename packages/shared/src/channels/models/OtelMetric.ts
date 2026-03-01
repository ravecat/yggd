/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { OtelNumberDataPoint } from "./OtelNumberDataPoint.js";

export interface OtelMetric {
  name: string;
  unit?: string;
  gauge: {
    dataPoints?: OtelNumberDataPoint[];
  };
}
