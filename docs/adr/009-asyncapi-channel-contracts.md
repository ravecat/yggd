# ADR-009: AsyncAPI for Async Channel Contracts

## Metadata

- ID: ADR-009
- Status: accepted
- Date: 2026-02-21
- Deciders: Max

## Context and problem statement

The project has two WebSocket channel types (Yjs canvas sync and telemetry metrics push) served by `phoenix_framework`.
These async contracts need a machine-readable specification analogous to how OpenAPI describes the HTTP API, so that
frontend implementations across all frameworks can rely on a single source of truth for channel topics, message
payloads, and event semantics.

## Decision drivers

- Parity with HTTP contracts: OpenAPI describes REST, async channels need an equivalent spec.
- Code generation potential: generate TypeScript types for channel messages from the spec.
- Framework-agnostic: the spec must not be tied to any frontend framework.
- Industry adoption: prefer a CNCF/Linux Foundation backed standard over ad-hoc documentation.

## Considered options

### Option A

- Description: AsyncAPI specification (`asyncapi.yaml`)
- Good, because purpose-built for event-driven APIs (WebSocket, message brokers, SSE).
- Good, because supports channel bindings for WebSocket protocol details.
- Good, because machine-readable - enables codegen and validation tooling.
- Good, because CNCF-backed with active ecosystem.
- Bad, because Phoenix channel protocol has no native AsyncAPI binding (requires custom extension).

### Option B

- Description: Document channels in markdown only (no formal spec)
- Good, because zero tooling overhead.
- Bad, because no codegen, no validation, no machine-readable contract.
- Bad, because easy to drift from implementation.

### Option C

- Description: Extend OpenAPI with WebSocket descriptions
- Good, because single spec file for all APIs.
- Bad, because OpenAPI is designed for request-response, not event-driven patterns.
- Bad, because WebSocket support in OpenAPI is minimal and non-standard.

## Decision outcome

Chosen option: "Option A: AsyncAPI specification", because it provides a standards-based, machine-readable contract
for async channels that complements the existing OpenAPI spec for HTTP. The spec lives at `asyncapi.yaml` in the
project root alongside `openapi.json`.

### Positive consequences

- Single source of truth for channel topics, message schemas, and event semantics.
- Consistent contract approach: OpenAPI for HTTP (F1 Tasks), AsyncAPI for WebSocket (F2 Canvas, F3 Telemetry).
- Enables future codegen of TypeScript types for channel messages.
- Documents both canvas (bidirectional CRDT) and telemetry (server-push) patterns in one spec.

### Negative consequences

- Phoenix channel protocol requires custom binding documentation (no official AsyncAPI binding exists).
- Additional spec file to maintain alongside `openapi.json`.
- Limited tooling for Phoenix-specific async validation compared to OpenAPI ecosystem maturity.

## Links

- Related ADRs: ADR-003 (Phoenix channels), ADR-004 (API contract/OpenAPI)
- After-action review: 2026-03-21
