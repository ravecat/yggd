# ADR-005: Styling Approach

## Metadata

- ID: ADR-005
- Status: accepted
- Date: 2025-02-15
- Deciders: Max

## Context and problem statement

Five frontend apps need visually consistent TODO interfaces while using each framework's idiomatic styling approach. The
styling strategy must balance visual consistency with framework-specific learning.

## Decision drivers

- Visual consistency: apps should look recognizably similar for comparison purposes.
- Framework-native patterns: each app should use its framework's preferred styling approach.
- Learning value: experience each framework's styling capabilities.
- Maintenance: minimize shared styling overhead.

## Considered options

### Option A

- Description: Tailwind CSS everywhere
- Good, because identical utility classes produce identical UIs.
- Good, because tests Tailwind integration in each framework.
- Bad, because Tailwind config differs per framework (PostCSS vs Vite plugin vs built-in).
- Bad, because less learning of framework-native styling.

### Option B

- Description: Fully framework-native (independent styling per app)
- Good, because maximum per-framework learning.
- Bad, because apps may look completely different, making comparison harder.
- Bad, because no shared design foundation.

### Option C

- Description: Shared CSS design tokens + framework-native styling
- Good, because visual consistency via shared tokens.
- Good, because each framework uses idiomatic styling.
- Good, because CSS custom properties need zero framework-specific tooling.
- Bad, because tokens alone don't guarantee identical UIs.

## Decision outcome

Chosen option: "Option C: Shared CSS design tokens + framework-native styling", because CSS custom properties work
universally in all frameworks without build tool dependencies, provide visual consistency through shared
colors/spacing/typography, and each app still uses its framework's idiomatic styling patterns.

### Positive consequences

- Shared `tokens.css` already exists in `packages/shared` - just needs expansion.
- CSS custom properties are framework-agnostic (no build plugin needed).
- Each app learns its framework's styling: Svelte scoped styles, Vue SFC styles, CSS modules, etc.
- Easy to maintain consistent look without coupling implementations.

### Negative consequences

- Less Tailwind learning across frameworks (only Next.js uses it currently).
- Design tokens are limited to primitives (colors, spacing, fonts) - component-level consistency requires manual effort.

## Links

- Related ADRs: ADR-004 (shared package hosts tokens.css via API client package)
- After-action review: 2025-03-15
