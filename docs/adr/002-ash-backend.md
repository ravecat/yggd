# ADR-002: Ash as API Backend

## Metadata

- ID: ADR-002
- Status: accepted
- Date: 2025-02-15
- Deciders: Max

## Context and problem statement

The project needs an API backend for CRUD operations and authentication. The backend is not a learning target - client
frameworks are - so the API layer should require minimal code while providing a type-safe, standards-compliant contract.

## Decision drivers

- Rapid prototyping: plugin system should generate CRUD + auth with minimal handwritten code.
- Standards compliance: API should follow a recognized spec for codegen and tooling.
- Minimize backend work: frontend frameworks are the learning focus.
- Existing code: `apps/ash_framework` is already functional with basic resources.

## Considered options

### Option A

- Description: Ash Framework (plugin-based rapid prototyping)
- Good, because plugin system generates CRUD + auth from declarations.
- Good, because JSON:API compliance enables standard tooling.
- Good, because already implemented and functional.
- Bad, because Ash DSL has its own learning curve.
- Bad, because smaller community than vanilla Phoenix.

### Option B

- Description: Phoenix controllers (manual REST endpoints)
- Good, because most documented and understood Elixir web pattern.
- Bad, because every endpoint, serializer, and auth flow must be handwritten.
- Bad, because no codegen pipeline without additional setup.

### Option C

- Description: Node.js backend (Express/Fastify)
- Good, because same language as frontend apps.
- Bad, because adds a third language/runtime to the monorepo.
- Bad, because loses Elixir/OTP benefits for channels (see ADR-003).

## Decision outcome

Chosen option: "Option A: Ash Framework", because its plugin system (AshJsonApi, AshAuthentication) generates a
JSON:API-compliant REST API and magic link auth from resource declarations with minimal code. This keeps backend work to
a minimum while producing a standards-based contract suitable for OpenAPI codegen.

### Positive consequences

- AshJsonApi generates JSON:API endpoints from resource declarations.
- AshAuthentication adds magic link auth with minimal configuration.
- OpenAPI spec generated automatically for TypeScript client codegen.
- Resource-level authorization and validation built in.

### Negative consequences

- Ash has a learning curve of its own (DSL, resource patterns).
- Less community adoption than Phoenix controllers - harder to debug edge cases.
- If Ash proves limiting, fallback to Phoenix controllers is possible (see ADR-003).

## Links

- Related ADRs: ADR-003 (Phoenix for real-time), ADR-004 (JSON:API contract built on Ash)
- After-action review: 2025-03-15
