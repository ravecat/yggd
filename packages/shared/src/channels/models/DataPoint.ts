/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { KeyValue } from "./KeyValue.js";

export interface DataPoint {
  timeUnixNano: string;
  asDouble?: number;
  asInt?: string;
  attributes?: KeyValue[];
}
