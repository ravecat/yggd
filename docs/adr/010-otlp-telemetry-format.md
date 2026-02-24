# ADR-010: OTLP JSON for Telemetry Data Format

## Metadata

- ID: ADR-010
- Status: accepted (refined 2026-02-25)
- Date: 2026-02-21
- Deciders: Max

## Context and problem statement

The Telemetry page (F3) pushes BEAM VM and host system metrics from `phoenix_framework` to frontend clients over a
Phoenix WebSocket channel. The metrics payload needs a structured format. The choice is between a custom JSON schema
and an industry standard.

## Decision drivers

- Standardization: use a well-known format so any client can parse without custom documentation.
- Erlang ecosystem fit: the format should integrate naturally with Erlang `:telemetry` and OTP observability tooling.
- Learning value: exposure to industry-standard observability protocols.
- Lightweight: the format must be serializable as JSON for transport over Phoenix channels (no protobuf requirement).

## Considered options

### Option A (original)

- Description: OTLP JSON encoding via `opentelemetry_erlang` SDK
- Good, because CNCF standard - widely adopted across observability ecosystem.
- Good, because `opentelemetry_erlang` SDK subscribes to Erlang `:telemetry` events natively (via bridge libraries).
- Good, because OTLP has a JSON encoding - no protobuf/gRPC needed on the client.
- Good, because structured envelope (`resourceMetrics` -> `scopeMetrics` -> `metrics`) is self-describing.
- Bad, because `opentelemetry_erlang` metrics API is experimental - the SDK is mature for traces, not metrics.
- Bad, because the SDK is designed for collector export (gRPC/HTTP), not Phoenix channel push - would require a
  custom exporter to bridge SDK output to PubSub.
- Bad, because adds `opentelemetry`, `opentelemetry_api`, `opentelemetry_exporter` dependencies for a feature that
  needs only the JSON format, not the full pipeline.

### Option A' (refined)

- Description: OTLP JSON encoding (data model + semantic conventions) without `opentelemetry_erlang` SDK. Collection
  via native Erlang `:telemetry` + `:os_mon`. Manual OTLP JSON formatting.
- Good, because same CNCF standard payload format - any OTel-compatible tool can consume it.
- Good, because zero new Hex dependencies (`:os_mon` is OTP built-in, `jason` already present).
- Good, because building the OTLP envelope manually teaches the data model deeper than SDK abstraction.
- Good, because direct `:telemetry.attach` + `telemetry_poller` are already set up in the project.
- Good, because no custom exporter needed - format JSON, broadcast via PubSub, done.
- Bad, because manual OTLP JSON construction must stay in sync with spec (low risk - format is stable).
- Bad, because no automatic instrumentation (must explicitly subscribe to each `:telemetry` event).

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

Chosen option: "Option A' (refined): OTLP JSON data model without SDK", because it preserves the CNCF-standard
payload format while eliminating the SDK dependency that does not fit the channel-push architecture. The
`opentelemetry_erlang` SDK is designed for trace export to collectors - its metrics API is experimental, and pushing
to a Phoenix channel would require a custom exporter that negates the SDK's value. Manual OTLP JSON formatting via
`:telemetry` + `:os_mon` + `jason` is simpler, has zero new dependencies, and provides deeper learning of the OTel
data model.

Data flow: `:telemetry` events + `:os_mon` -> `MetricsBroadcaster` -> OTLP JSON via `jason` -> PubSub -> Phoenix
channel push -> browser parse -> uPlot.

### Positive consequences

- Metrics payload follows an open standard - any OTel-compatible tool can consume it.
- Zero new Hex dependencies - uses only OTP built-ins and existing project deps.
- Manual envelope construction teaches OTel Metrics Data Model internals (resource, scope, metric types, data points,
  attributes, units, semantic conventions).
- Consistent standards approach: JSON:API for HTTP, AsyncAPI for channel spec, OTLP for metrics payload.
- Future extensibility: adding new metrics requires no client-side format changes.
- If a collector/backend is added later, the payload format is already OTLP-compatible.

### Negative consequences

- OTLP JSON envelope is heavier than a flat custom format (~2-3x payload size for nine metrics).
- Frontend must parse nested OTLP structure to extract metric values for uPlot.
- Manual OTLP JSON construction is a small maintenance surface (~50 lines of Elixir).

## Links

- Related ADRs: ADR-003 (Phoenix channels), ADR-009 (AsyncAPI)
- Design doc: [telemetry-design.md](../telemetry-design.md)
- After-action review: 2026-03-21
