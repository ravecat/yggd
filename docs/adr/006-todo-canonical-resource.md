# ADR-006: Todo as Canonical Task Resource

## Metadata

- ID: ADR-006
- Status: accepted
- Date: 2026-02-16
- Deciders: Max

## Context and problem statement

The backend currently contains legacy `Post` naming while product scope, UI, and API usage are TODO-centric. This
creates an avoidable ambiguity in resource semantics, API contracts, and generated client types across five frontend
apps.

## Decision drivers

- Domain clarity: task semantics should be explicit in resource naming.
- Contract stability: generated clients should rely on one canonical JSON:API resource shape.
- Migration safety: transition should avoid blocking parallel frontend milestones.
- Backend simplicity: avoid long-term dual resource ownership.

## Considered options

### Option A

- Description: Hard rename `Post` to `Todo` immediately.
- Good, because converges instantly to one canonical model.
- Good, because removes legacy naming in one step.
- Bad, because creates a hard breaking change for in-flight clients and fixtures.
- Bad, because rollback path is narrow if migration issues appear late.

### Option B

- Description: Keep `Post` and add independent `Todo` resource long-term.
- Good, because avoids immediate breakage.
- Good, because allows incremental adoption without deadlines.
- Bad, because duplicates domain logic and increases drift risk.
- Bad, because preserves semantic ambiguity in contracts and docs.

### Option C

- Description: Adopt `Todo` as canonical resource with a short compatibility window for `Post`.
- Good, because establishes a single long-term model (`/todos`, `type: "todo"`).
- Good, because enables staged migration across apps without hard cutover risk.
- Good, because keeps rollback/fallback available during transition.
- Bad, because temporarily increases backend maintenance complexity.
- Bad, because requires strict deprecation cutoff discipline.

## Decision outcome

Chosen option: "Option C", because it gives a clean long-term domain model while keeping migration risk controlled for a
multi-app rollout. `Todo` is canonical immediately for all new work; `Post` is compatibility-only during the migration
window and must be removed after cutover completion.

### Positive consequences

- One canonical task contract across backend, codegen, and frontend apps.
- Clear ownership of future API changes under `Todo`.
- Lower confusion in docs and milestone planning.

### Negative consequences

- Temporary compatibility layer needs explicit ownership.
- Migration completion criteria and removal date must be enforced.

## Links

- Related ADRs: ADR-002 (Ash backend), ADR-004 (API contract)
- Supersedes: (if applicable)
- After-action review: 2026-03-16
