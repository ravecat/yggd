# Product Delivery Plan - Moda

## Metadata

- Product: Multi-framework TODO application
- Scope level: product
- Planning horizon: current release cycle (target dates TBD)
- Owner: Max
- Status: draft
- Related docs: [Design doc](design-doc.md), [ADR-006](adr/006-todo-canonical-resource.md),
  [ADR-007](adr/007-zod-runtime-validation.md), [ADR-008](adr/008-simplified-filter-surface.md)

## Goal and release definition of done

- Goal: Deliver functional parity across 5 frontend frameworks (Next.js, SvelteKit, Nuxt, Qwik, SolidStart) on a shared
  Ash and Phoenix backend.
- Done when: all release increments are complete and launch criteria below pass.

## Release increments

| Increment | Outcome                                   | Included slices or features                                                      | Dependencies            | Owner | Target date | Exit criteria                                                          |
| --------- | ----------------------------------------- | -------------------------------------------------------------------------------- | ----------------------- | ----- | ----------- | ---------------------------------------------------------------------- |
| R0        | Backend foundation ready                  | Canonical Todo contract, simplified filters, auth exchange, canvas, activity push | -                       | Max   | TBD         | OpenAPI exposes canonical `Todo`; filters simplified; build pass        |
| R1        | Shared frontend foundation ready          | React-free API client, generated types + Zod schemas, design tokens              | R0 (contract stability) | Max   | TBD         | `packages/shared` builds, tests pass, Zod schemas generated            |
| R2        | Reference implementation aligned          | Next.js app adopts Todo contract, verifies Tasks, Canvas, Activity               | R0, R1                  | Max   | TBD         | Next.js build passes and all 3 tabs + auth flow work                   |
| R3        | Trail-blazer for non-React pattern        | SvelteKit app with all 3 tabs + auth                                             | R0, R1, R2 patterns     | Max   | TBD         | SvelteKit build passes and parity checks succeed                       |
| R4        | Framework expansion complete              | Nuxt, Qwik, SolidStart parity implementation                                     | R0, R1, R3 recommended  | Max   | TBD         | Nuxt, Qwik, SolidStart builds pass and parity checks succeed           |
| R5        | Comparison and release readiness complete | Cross-framework comparison report (DX, bundle size, SSR, realtime, code sharing) | R2, R3, R4              | Max   | TBD         | Comparison doc published and launch gate checks pass                   |

## Sequencing and critical path

- Critical path: R0 + R1 -> R2 -> R3 -> R5.
- Parallel workstreams: after R0 + R1, Nuxt, Qwik, and SolidStart work can run in parallel inside R4.
- R0 and R1 can run in parallel, but R1 should lock only after Todo contract and compatibility policy are stable.

## Cross-team dependencies

- Dependency: Canonical `Todo` contract and compatibility window (`Post` -> `Todo`)
  - Owner: `ash_framework`
  - Needed by: R1, R2, R3, R4
  - Fallback: keep temporary compatibility layer until all apps pass cross-app smoke checks
- Dependency: Shared API client and token package stability
  - Owner: `packages/shared`
  - Needed by: R2, R3, R4
  - Fallback: pin generated client version per app until unified package is stable
- Dependency: Generated Zod validation schemas stability
  - Owner: `packages/shared`
  - Needed by: R2, R3, R4
  - Fallback: use TypeScript types only and defer runtime validation until schemas stabilize
- Dependency: Realtime contracts for canvas and activity channels
  - Owner: `phoenix_framework`
  - Needed by: R2, R3, R4
  - Fallback: temporary client-only canvas mode and degraded activity stream rendering

## Risks and mitigations

- Risk 1: `Post` -> `Todo` cutover breaks generated clients during parallel frontend work.
  - Mitigation: owner Max; timing R0 to R2; fallback keep compatibility window through R2 and remove only after
    cross-app build and smoke checks pass.
- Risk 2: Qwik serialization boundary may break Yjs binary sync over WebSocket.
  - Mitigation: owner Max; timing early in R4; fallback client-only canvas mode for Qwik until stable adapter exists.
- Risk 3: Qwik City and SolidStart Nx plugin limitations slow project setup.
  - Mitigation: owner Max; timing start of R4; fallback manual `project.json` configuration and direct Vite integration.
- Risk 4: SolidStart integration with Phoenix channel helpers may require custom adapter.
  - Mitigation: owner Max; timing R4; fallback thin wrapper around raw Phoenix socket protocol.
- Risk 5: Shared package accidentally keeps transitive React coupling.
  - Mitigation: owner Max; timing R1; fallback split framework-neutral exports and isolate React-only entrypoint.

## Release gates

- Gate 1: Foundation readiness
  - Entry criteria: R0 and R1 in progress with stable contract direction approved.
  - Exit criteria: canonical Todo contract published, client regenerated, `ash_framework` and `packages/shared` build
    and test checks pass.
- Gate 2: Cross-framework parity readiness
  - Entry criteria: R2, R3, R4 implementations complete.
  - Exit criteria: all 5 apps pass build, parity checks, auth checks, and comparison document is completed.

## Launch criteria and rollback

- Technical:
  - All 5 apps: `nx run {app}:build` succeeds.
  - All 5 apps: Tasks, Canvas, Activity tabs are functional.
  - All 5 apps: Google OAuth + PKCE token exchange auth flow works.
  - All 5 apps: shared design tokens from `packages/shared` are applied.
- Product:
  - Comparison document is published with apples-to-apples framework evaluation.
- Rollback trigger:
  - Canonical Todo contract causes blocking regression in 2 or more frontend apps.
  - Realtime sync instability causes data loss or persistent desync in canvas flow.
  - Auth flow regression blocks sign-in on release candidate builds.
- Rollback validation: restore last known good compatibility state (`Post` compatibility enabled, previous generated
  client version), then confirm `nx run {app}:build` succeeds for all affected apps and smoke checks pass for Tasks,
  Canvas, Activity, and auth.
