# ADR-007: Zod Runtime Validation from OpenAPI

## Metadata

- ID: ADR-007
- Status: accepted
- Date: 2026-02-17
- Deciders: Max

## Context and problem statement

The current Kubb pipeline (ADR-004) generates TypeScript types from the OpenAPI spec, providing compile-time safety.
However, TypeScript types are erased at runtime - invalid payloads from the server or malformed request bodies are not
caught until they cause downstream failures. Additionally, manual configuration files (`config/todos.ts`) duplicate
constraints already expressed in the OpenAPI spec (pagination limits, sort options, enum values), creating a drift risk
between the spec and the client.

## Decision drivers

- Runtime type safety: catch invalid payloads at system boundaries before they propagate.
- Single source of truth: OpenAPI spec should be the only place where validation constraints are defined.
- Maintenance cost: eliminate manual config files that duplicate spec-level constraints.
- Bundle impact: Zod v4 supports tree-shaking and is significantly smaller than v3.

## Considered options

### Option A

- Description: Maintain hand-written Zod schemas alongside generated TypeScript types.
- Good, because full control over validation logic and custom error messages.
- Bad, because schemas must be kept in sync with OpenAPI spec manually.
- Bad, because doubles the surface area that must be updated on every contract change.
- Bad, because drift between spec and runtime validation defeats the purpose.

### Option B

- Description: Generate Zod schemas from OpenAPI spec via Kubb `plugin-zod`.
- Good, because schemas are always in sync with the spec - zero manual maintenance.
- Good, because validation constraints (enums, min/max, regex patterns) come directly from the spec.
- Good, because removes the need for manual config files (`config/todos.ts`).
- Good, because Zod v4 tree-shaking keeps bundle impact minimal.
- Bad, because generated schemas may need wrapper functions for custom error formatting.

### Option C

- Description: Use alternative runtime validation libraries (io-ts, effect/schema, valibot).
- Good, because some alternatives offer better TypeScript inference (effect/schema) or smaller bundles (valibot).
- Bad, because no mature Kubb plugin exists for these alternatives.
- Bad, because Zod has the broadest ecosystem adoption and tooling support.
- Bad, because switching validation library adds integration risk without proportional benefit.

## Decision outcome

Chosen option: "Option B", because it eliminates the drift risk between OpenAPI spec and runtime validation while
requiring zero manual maintenance. The Kubb `plugin-zod` generates Zod v4 schemas to
`packages/shared/src/api/generated/zod/`, covering all endpoint request parameters, request bodies, and response
payloads. Manual `config/todos.ts` is removed - pagination limits, sort options, and enum constraints are now derived
from the spec via generated schemas.

### Positive consequences

- One command (`pnpm codegen`) regenerates types and validation schemas from the same spec.
- Runtime validation available at every system boundary (server actions, API route handlers, form validation).
- Manual configuration file eliminated - fewer files to maintain, no drift.
- Zod schemas serve as executable documentation of API contracts.

### Negative consequences

- Generated Zod schemas are verbose and not human-authored - readability tradeoff.
- Custom validation logic (beyond what the spec expresses) must be layered on top of generated schemas.
- Adding Zod v4 as a dependency increases `packages/shared` package size.

## Links

- Related ADRs: ADR-004 (API contract pipeline), ADR-006 (Todo canonical resource)
- Supersedes: (none)
- After-action review: 2026-03-17
