# ADR-003: Phoenix for Real-Time Functionality

## Metadata

- ID: ADR-003
- Status: accepted
- Date: 2025-02-15
- Deciders: Max

## Context and problem statement

The app needs real-time functionality for two features: a collaborative Yjs canvas (bidirectional CRDT sync) and a live
activity chart (server-push streaming). Both require persistent WebSocket connections with server-side state management.

## Decision drivers

- Familiarity: Phoenix channels are a known, comfortable environment for WebSocket work.
- Fallback: Phoenix can serve as a general-purpose backend if Ash (ADR-002) proves limiting.
- Existing code: `apps/phoenix_framework` already has Yjs persistence, SharedDoc processes, and channel infrastructure.
- OTP benefits: supervision trees, process registry, and PubSub are native to the BEAM.

## Considered options

### Option A

- Description: Phoenix channels (existing `phoenix_framework` app)
- Good, because already implemented and tested.
- Good, because familiar environment with known patterns.
- Good, because OTP supervision and PubSub are native.
- Good, because serves as fallback if Ash proves limiting.
- Bad, because second service adds operational complexity.

### Option B

- Description: Standalone WebSocket server (Node.js with ws/Socket.IO)
- Good, because same runtime as frontend apps.
- Bad, because requires reimplementing Yjs persistence from scratch.
- Bad, because loses BEAM concurrency model (process per doc).
- Bad, because adds a third language/runtime to the monorepo.

### Option C

- Description: Ash channels (add WebSocket support to `ash_framework`)
- Good, because single backend service.
- Bad, because Ash has no native channel/WebSocket support.
- Bad, because significant backend work on a non-priority area.

## Decision outcome

Chosen option: "Option A: Phoenix channels", because the infrastructure is already implemented (Yjs persistence,
SharedDoc server, channel handlers), Phoenix channels are a familiar environment, and the BEAM provides native
concurrency primitives (processes per document, PubSub, supervision) that fit the real-time use case well. Phoenix also
serves as a fallback backend if Ash proves limiting for the API layer. MVP scope: channels are public and do not
validate Ash-issued tokens on join.

### Positive consequences

- Yjs sync infrastructure already working (SharedDoc, persistence, channel tests).
- Adding an activity channel is trivial (GenServer with timer + channel push).
- BEAM process model maps naturally to per-document state.
- Familiar development environment.

### Negative consequences

- Frontend apps need a second backend connection (Ash for HTTP, Phoenix for WebSocket).
- No per-user access control on channels in MVP.
- Any client can join and push channel events.
- Two Elixir apps to run during development.

## Links

- Related ADRs: ADR-002 (Ash as API backend)
- After-action review: 2025-03-15
