/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

import type { PriceTick } from "./PriceTick.js";

export interface ChartJoinReply {
  status: "ok";
  response: {
    history: PriceTick[];
  };
}
