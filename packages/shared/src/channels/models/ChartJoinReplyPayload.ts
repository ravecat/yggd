/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { PriceTick } from "./PriceTick.js";

export interface ChartJoinReplyPayload {
  status: "ok";
  response: {
    history: PriceTick[];
  };
}
