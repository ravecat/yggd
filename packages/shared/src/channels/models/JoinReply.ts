/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

export type JoinReply =
  | {
      status: "ok";
      response: Record<string, unknown>;
    }
  | {
      status: "error";
      response: {
        reason: string;
      };
    };
