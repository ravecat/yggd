/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

export interface OtelResourceMetrics {
  resource: {
    attributes?: {
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
    }[];
  };
  scopeMetrics: {
    scope?: {
      name?: string;
      version?: string;
    };
    metrics?: {
      /**
       * Metric name following OTel semantic conventions.
       * Examples: system.cpu.load_average.1m, process.runtime.beam.process_count
       *
       */
      name: string;
      /**
       * OTel unit string. Examples: "1" (dimensionless), "By" (bytes),
       * "ms" (milliseconds), "{process}" (count of processes)
       *
       */
      unit?: string;
      gauge: {
        dataPoints?: {
          /**
           * Timestamp as nanoseconds since Unix epoch, encoded as string
           */
          timeUnixNano: string;
          /**
           * Floating-point metric value
           */
          asDouble?: number;
          /**
           * Integer metric value, encoded as string per OTLP convention
           */
          asInt?: string;
          attributes?: {
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
          }[];
        }[];
      };
    }[];
  }[];
}
