# ADR-004: API Contract

## Metadata

- ID: ADR-004
- Status: accepted
- Date: 2025-02-15
- Deciders: Max

## Context and problem statement

Five frontend apps need to communicate with the Ash Framework backend for CRUD operations and authentication. The API
contract must be consistent, type-safe, and work with each framework's data-fetching patterns (server components, load
functions, composables, etc.).

## Decision drivers

- Type safety: generated TypeScript types from a single source of truth.
- Framework compatibility: the HTTP client must work in SSR (Node.js) and CSR (browser) contexts across all 5
  frameworks.
- Code generation: minimize manual API client maintenance.
- Ash ecosystem alignment: use Ash-native API layer for minimal backend work.

## Considered options

### Option A

- Description: JSON:API via Ash JSON API + OpenAPI codegen (Kubb)
- Good, because already implemented and working.
- Good, because generated types eliminate manual maintenance.
- Good, because JSON:API standardizes query patterns.
- Bad, because verbose response format.
- Bad, because axios adds bundle size where native fetch would suffice.

### Option B

- Description: GraphQL via AshGraphql + codegen (graphql-codegen)
- Good, because flexible queries, only fetch needed fields.
- Good, because strong ecosystem of framework-specific clients (Apollo, urql, TRPC-like).
- Bad, because requires adding AshGraphql to backend (additional work).
- Bad, because each framework would need a different GraphQL client library.
- Bad, because over-engineering for a TODO app.

### Option C

- Description: Custom REST via Phoenix controllers
- Good, because simplest response format.
- Bad, because requires manual Phoenix controller code for every endpoint.
- Bad, because no codegen pipeline - types must be maintained manually.
- Bad, because loses Ash resource benefits (authorization, validation, etc.).

## Decision outcome

Chosen option: "Option A: JSON:API via Ash JSON API + OpenAPI codegen", because the infrastructure already exists (Ash
JSON API, OpenAPI spec generation, Kubb codegen), produces framework-agnostic axios-based client functions, and requires
zero additional backend work.

### Positive consequences

- Existing pipeline: `ash_framework` -> `openapi.json` -> Kubb -> TypeScript clients in `packages/shared`.
- Generated client functions are pure async TypeScript - work in any framework.
- JSON:API provides standardized filtering, sorting, pagination, includes.
- Type-safe request/response shapes across all apps.

### Negative consequences

- JSON:API response envelope (`data`, `included`, `relationships`) is more verbose than plain REST.
- Axios dependency may be unnecessary for frameworks with built-in fetch (Qwik, SolidStart). Acceptable tradeoff for
  learning project.
- No real-time data (WebSocket/channels handled separately by `phoenix_framework`).

## Links

- Related ADRs: ADR-002 (Ash backend generates the API)
- After-action review: 2025-03-15
