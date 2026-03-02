/**
 * Generated from AsyncAPI spec (asyncapi.yaml).
 * Do not edit manually.
 */

/**
 * Yjs frame serialized in binary.
 * Encoding uses varUint message prefixes (not JSON arrays):
 * - Top-level `0` => sync protocol message
 * - Top-level `1` => awareness protocol update
 * - Top-level `3` => awareness query
 * For sync messages, nested sync subtypes are:
 * - `0` => sync step 1
 * - `1` => sync step 2
 * - `2` => update
 * See https://github.com/yjs/y-protocols for encoding details.
 *
 */
export type YjsBinaryPayload = ArrayBuffer;
