# ADR-001: Monorepo Tooling

## Metadata

- ID: ADR-001
- Status: accepted
- Date: 2025-02-15
- Deciders: Max

## Context and problem statement

The project needs a monorepo tool to manage multiple frontend apps (Next.js, SvelteKit, Nuxt, Qwik, SolidStart), two
Elixir backends, and shared TypeScript packages. The tool must handle polyglot workspaces, task orchestration, caching,
and dependency graph management.

## Decision drivers

- Polyglot support: must handle both Node.js/TypeScript and Elixir projects in one workspace.
- Plugin ecosystem: first-class or community plugins for Next.js, SvelteKit, Nuxt, Vite-based frameworks.
- Task caching and dependency graph: avoid redundant builds across interdependent packages.
- Docker integration: ability to orchestrate container builds as part of the task graph.
- Maturity and community: stable tooling with active maintenance.

## Considered options

### Option A

- Description: Nx
- Good, because broadest plugin ecosystem and polyglot support.
- Good, because computation caching reduces build times.
- Good, because `project.json` approach works for any language/tool.
- Bad, because configuration can be verbose for non-standard setups.

### Option B

- Description: Turborepo
- Good, because simpler configuration than Nx.
- Good, because fast task execution with caching.
- Bad, because no equivalent of `project.json` for non-JS tasks - Elixir targets need wrapper scripts.
- Bad, because no Docker plugin or framework-specific generators.

### Option C

- Description: Bazel
- Good, because language-agnostic by design, handles polyglot natively.
- Bad, because extremely high configuration complexity for web projects.
- Bad, because poor DX for rapid frontend development.

### Option D

- Description: Just pnpm workspaces (no orchestrator)
- Good, because zero additional tooling overhead.
- Bad, because no task caching, no dependency graph, no affected commands.
- Bad, because no Elixir integration - would need separate scripting.

## Decision outcome

Chosen option: "Nx", because it has the broadest plugin ecosystem (including `@nx/next`, `@nx/vite`, `@nx/docker`),
supports polyglot workspaces via generic `project.json` targets, provides computation caching, and has a TUI for
parallel task execution.

### Positive consequences

- First-class plugins for Next.js and Vite-based frameworks.
- Generic `run-commands` executor works for Elixir `mix` targets.
- `@nx/docker` plugin for container build orchestration.
- Dependency graph visualization and affected commands.
- pnpm workspace compatibility.

### Negative consequences

- Nx has its own learning curve and configuration surface.
- Some framework plugins (Qwik, SolidStart) are community-maintained or require manual `project.json`.
- Nx version upgrades can require migration scripts.

## Links

- Related ADRs: none
- After-action review: 2025-03-15
