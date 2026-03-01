/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { OtelKeyValue } from "./OtelKeyValue.js";

export interface OtelNumberDataPoint {
  timeUnixNano: string;
  asDouble?: number;
  asInt?: string;
  attributes?: OtelKeyValue[];
}
