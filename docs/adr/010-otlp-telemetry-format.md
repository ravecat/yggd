# ADR-010: OTLP JSON for Telemetry Data Format

## Metadata

- ID: ADR-010
- Status: accepted (revised 2026-02-25)
- Date: 2026-02-21
- Deciders: Max

## Context and problem statement

The Telemetry page (F3) pushes BEAM VM and host system metrics from `phoenix_framework` to frontend clients over a
Phoenix WebSocket channel. The metrics payload needs a structured format. The choice is between a custom JSON schema
and an industry standard.

## Decision drivers

- Standardization: use a well-known format so any client can parse without custom documentation.
- Erlang ecosystem fit: the format should integrate naturally with Erlang `:telemetry` and OTP observability tooling.
- Learning value: exposure to industry-standard observability protocols and SDK internals.
- Lightweight: the format must be serializable as JSON for transport over Phoenix channels (no protobuf requirement).
- Extensibility: adding a real OTLP collector later should require minimal code changes.

## Considered options

### Option A (original - revised to chosen)

- Description: OTLP JSON encoding via `opentelemetry_erlang` SDK with a custom channel exporter.
- Good, because CNCF standard - widely adopted across observability ecosystem.
- Good, because `opentelemetry_erlang` SDK subscribes to Erlang `:telemetry` events natively (via bridge libraries).
- Good, because OTLP has a JSON encoding - no protobuf/gRPC needed on the client.
- Good, because structured envelope (`resourceMetrics` -> `scopeMetrics` -> `metrics`) is self-describing.
- Good, because SDK provides real histogram aggregation (true p50/p95) vs manual EMA approximation.
- Good, because Observable Gauge API cleanly separates metric definition from collection logic.
- Good, because if a collector/backend is added later, only the exporter changes - instrumentation stays.
- Good, because deepens understanding of real-world OTel SDK architecture (instruments, readers, exporters).
- Bad, because `opentelemetry_erlang` metrics API is marked experimental (stable for traces, experimental for metrics).
- Bad, because adds `opentelemetry_api`, `opentelemetry`, `opentelemetry_phoenix` dependencies.
- Bad, because requires a custom exporter to bridge SDK output to PubSub (no off-the-shelf channel exporter exists).

### Option A' (previously chosen, now superseded)

- Description: OTLP JSON encoding (data model + semantic conventions) without `opentelemetry_erlang` SDK. Collection
  via native Erlang `:telemetry` + `:os_mon`. Manual OTLP JSON formatting.
- Good, because zero new Hex dependencies (`:os_mon` is OTP built-in, `jason` already present).
- Good, because building the OTLP envelope manually teaches the data model deeper than SDK abstraction.
- Bad, because HTTP latency percentiles require EMA approximation instead of real histogram aggregation.
- Bad, because misses SDK architecture internals (instruments, readers, exporters) as a learning experience.
- Bad, because adding a real OTLP collector later requires rewriting the entire collection layer.

### Option B

- Description: Custom JSON format (ad-hoc `{ metric, value, timestamp }`)
- Bad, because no standard - every client must know the custom schema.
- Bad, because no ecosystem tooling.
- Bad, because misses the learning opportunity.

### Option C

- Description: Prometheus exposition format over HTTP endpoint
- Bad, because pull-based, contradicts server-push architecture of F3.
- Bad, because text-based format is harder to parse in browser JS than JSON.

## Decision outcome

Chosen option: "Option A (revised): OTel SDK with custom channel exporter", because it uses the full OTel SDK
pipeline (instruments → reader → exporter) which is the production-standard approach, provides real histogram
aggregation for HTTP latency percentiles, and offers better extensibility - if a Grafana/Datadog backend is added
later, only the exporter module changes. The custom `ChannelMetricsExporter` implements `otel_metrics_exporter`
behaviour and broadcasts to Phoenix.PubSub. The experimental status of the metrics API is an acceptable risk for
a learning project.

Data flow: Observable Gauge callbacks + HTTP Histogram → OTel SDK MetricReader (2s) → `ChannelMetricsExporter` →
PubSub → Phoenix channel push → browser parse → uPlot.

### Positive consequences

- Real OTel SDK pipeline - instruments, periodic reader, custom exporter.
- True histogram percentiles for HTTP latency (no EMA heuristic).
- Observable Gauge API: metric definition and collection are separated cleanly.
- Future extensibility: swap exporter to send to Grafana Cloud without touching instrumentation code.
- Three new dependencies justify the learning value.

### Negative consequences

- `opentelemetry_erlang` metrics API is experimental - may change between SDK versions.
- Three new Hex dependencies: `opentelemetry_api`, `opentelemetry`, `opentelemetry_phoenix`.
- Custom exporter adds ~50 lines that must implement Erlang behaviour correctly.
- OTLP JSON envelope is heavier than a flat custom format (~2-3x payload size for six metrics).

## Links

- Related ADRs: ADR-003 (Phoenix channels), ADR-009 (AsyncAPI), ADR-011 (uPlot)
- After-action review: 2026-03-21
