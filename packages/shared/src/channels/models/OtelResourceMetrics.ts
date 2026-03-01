/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { OtelKeyValue } from "./OtelKeyValue.js";
import type { OtelMetric } from "./OtelMetric.js";

export interface OtelResourceMetrics {
  resource: {
    attributes?: OtelKeyValue[];
  };
  scopeMetrics: {
    scope?: {
      name?: string;
      version?: string;
    };
    metrics?: OtelMetric[];
  }[];
}
