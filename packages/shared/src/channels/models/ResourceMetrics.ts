/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { KeyValue } from "./KeyValue.js";
import type { Metric } from "./Metric.js";

export interface ResourceMetrics {
  resource: {
    attributes?: KeyValue[];
  };
  scopeMetrics: {
    scope?: {
      name?: string;
      version?: string;
    };
    metrics?: Metric[];
  }[];
}
