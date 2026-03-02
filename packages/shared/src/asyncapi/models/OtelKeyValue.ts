/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

/**
 * OTel key-value attribute pair
 */
export interface OtelKeyValue {
  key: string;
  /**
   * Typed value (stringValue, intValue, doubleValue, boolValue)
   */
  value: {
    stringValue?: string;
    intValue?: string;
    doubleValue?: number;
    boolValue?: boolean;
  };
}
