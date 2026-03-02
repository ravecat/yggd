/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

export interface ChartJoinReplyPayload {
  status: "ok";
  response: {
    /**
     * Buffered price history (last 300 points, oldest first)
     */
    history: {
      /**
       * Event type (always "24hrMiniTicker")
       */
      e: string;
      /**
       * Event time in milliseconds since epoch
       */
      E: number;
      /**
       * Symbol (e.g. "BTCUSDT", "ETHUSDT")
       */
      s: string;
      /**
       * Close price (current price)
       */
      c: string;
      /**
       * Open price (24h)
       */
      o: string;
      /**
       * High price (24h)
       */
      h: string;
      /**
       * Low price (24h)
       */
      l: string;
      /**
       * Total traded base asset volume
       */
      v: string;
      /**
       * Total traded quote asset volume
       */
      q: string;
    }[];
  };
}
