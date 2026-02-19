# ADR-008: Simplified API Filter Surface

## Metadata

- ID: ADR-008
- Status: accepted
- Date: 2026-02-17
- Deciders: Max

## Context and problem statement

Ash JSON API auto-generates deeply nested filter objects in the OpenAPI spec for each resource. For the `Todo` resource
alone this produces 8 filter models (`TodoFilter`, `TodoFilterContent`, `TodoFilterCreatedAt`, `TodoFilterId`,
`TodoFilterStatus`, `TodoFilterTitle`, `TodoFilterUpdatedAt`, `TodoFilterUserId`) and 4 for `User`. These generate 12+
TypeScript type definitions, 12+ JSON schema files, and corresponding client code - none of which is consumed by any
frontend app. The generated filter surface adds roughly 2,000 lines of unused code to `packages/shared`.

## Decision drivers

- YAGNI: no frontend app uses the complex filter objects - all filtering uses simple query parameters.
- Generated code surface: 12+ unused type files and schema files increase build time and package size.
- Client DX: simpler generated types are easier to navigate and understand.
- Validation coverage: with Zod schemas (ADR-007) validating query parameters, filter models add no safety benefit.

## Considered options

### Option A

- Description: Keep full filter models in the OpenAPI spec and generated output.
- Good, because preserves the ability to use complex nested filters in the future.
- Bad, because 12+ unused type files and schemas add maintenance noise.
- Bad, because increases `packages/shared` bundle and build time for zero consumer benefit.
- Bad, because the complex filter types obscure the actually-used API surface in IDE autocomplete.

### Option B

- Description: Remove filter models from OpenAPI spec; validate query parameters via generated Zod schemas.
- Good, because eliminates ~2,000 lines of unused generated code.
- Good, because query parameter validation is handled by Zod schemas (ADR-007) at the right granularity.
- Good, because the generated API surface matches what consumers actually use.
- Bad, because re-introducing complex filtering later would require spec and codegen changes.

### Option C

- Description: Keep filter models but mark them as deprecated with a removal timeline.
- Good, because preserves backward compatibility during a transition window.
- Bad, because there are no consumers to transition - the filters were never used.
- Bad, because adds deprecation ceremony to unused code, which is unnecessary overhead.

## Decision outcome

Chosen option: "Option B", because the filter models are unused and add pure complexity. Removing them aligns the
generated output with actual consumer needs. Query parameter validation (sort, pagination, include, fields) is covered by
Zod schemas generated from the simplified OpenAPI spec. If complex filtering is needed in the future, it can be
re-introduced by updating the Ash resource configuration and regenerating.

### Positive consequences

- ~2,000 fewer lines of generated code in `packages/shared`.
- Cleaner IDE autocomplete and type navigation for API consumers.
- Faster codegen and build cycles.
- Generated output directly reflects actual API usage patterns.

### Negative consequences

- If a future frontend app needs complex nested filtering, filter models must be re-added to the spec.
- Reversal requires updating Ash resource config, regenerating the spec, and regenerating client code.

## Links

- Related ADRs: ADR-004 (API contract), ADR-007 (Zod runtime validation)
- Supersedes: (none)
- After-action review: 2026-03-17
