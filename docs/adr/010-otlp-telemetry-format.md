# ADR-010: OTLP JSON for Telemetry Data Format

## Metadata

- ID: ADR-010
- Status: accepted
- Date: 2026-02-21
- Deciders: Max

## Context and problem statement

The Telemetry page (F3) pushes BEAM VM metrics from `phoenix_framework` to frontend clients over a Phoenix WebSocket
channel. The metrics payload needs a structured format. The choice is between a custom JSON schema and an industry
standard.

## Decision drivers

- Standardization: use a well-known format so any client can parse without custom documentation.
- Erlang ecosystem fit: the format should integrate naturally with Erlang `:telemetry` and OTP observability tooling.
- Learning value: exposure to industry-standard observability protocols.
- Lightweight: the format must be serializable as JSON for transport over Phoenix channels (no protobuf requirement).

## Considered options

### Option A

- Description: OTLP JSON encoding (OpenTelemetry Protocol) via `opentelemetry_erlang` SDK
- Good, because CNCF standard - widely adopted across observability ecosystem.
- Good, because `opentelemetry_erlang` SDK subscribes to Erlang `:telemetry` events natively.
- Good, because OTLP has a JSON encoding - no protobuf/gRPC needed on the client.
- Good, because structured envelope (`resourceMetrics` -> `scopeMetrics` -> `metrics`) is self-describing.
- Bad, because OTLP JSON is verbose compared to a minimal custom format.
- Bad, because `opentelemetry_erlang` adds a dependency to `phoenix_framework`.

### Option B

- Description: Custom JSON format (ad-hoc `{ metric, value, timestamp }`)
- Good, because minimal payload size.
- Good, because zero additional dependencies.
- Bad, because no standard - every client must know the custom schema.
- Bad, because no ecosystem tooling (no validation, no codegen, no compatibility with external systems).
- Bad, because misses the learning opportunity.

### Option C

- Description: Prometheus exposition format over HTTP endpoint
- Good, because widely adopted for metrics scraping.
- Bad, because pull-based (requires polling), contradicts server-push architecture of F3.
- Bad, because text-based format is harder to parse in browser JS than JSON.
- Bad, because does not use Phoenix channels - breaks the integration pattern goal.

## Decision outcome

Chosen option: "Option A: OTLP JSON via `opentelemetry_erlang`", because it standardizes the metrics payload using a
CNCF-backed protocol, integrates with Erlang `:telemetry` natively, and provides a JSON encoding suitable for
WebSocket transport. The verbosity tradeoff is acceptable for a learning project.

Data flow: `:telemetry` events -> `opentelemetry_erlang` SDK -> OTLP JSON -> Phoenix channel push -> browser parse -> uPlot.

### Positive consequences

- Metrics payload follows an open standard - any OTel-compatible tool can consume it.
- `opentelemetry_erlang` handles `:telemetry` subscription and metric aggregation.
- Consistent standards approach: JSON:API for HTTP, AsyncAPI for channel spec, OTLP for metrics payload.
- Future extensibility: adding new metrics requires no client-side format changes.

### Negative consequences

- OTLP JSON envelope is heavier than a flat custom format (~2-3x payload size for three metrics).
- `opentelemetry_erlang` dependency in `phoenix_framework` mix.exs.
- Frontend must parse nested OTLP structure to extract metric values for uPlot.

## Links

- Related ADRs: ADR-003 (Phoenix channels), ADR-009 (AsyncAPI)
- After-action review: 2026-03-21
