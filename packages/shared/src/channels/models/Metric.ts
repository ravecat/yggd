/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { DataPoint } from "./DataPoint.js";

export interface Metric {
  name: string;
  unit?: string;
  gauge: {
    dataPoints?: DataPoint[];
  };
}
