# ADR-011: uPlot for Charting

## Metadata

- ID: ADR-011
- Status: accepted
- Date: 2026-02-21
- Deciders: Max

## Context and problem statement

The Telemetry page (F3) renders three real-time metric widgets: a big number with sparkline, a dual-series line chart,
and a counter with trend. The charting library must work across all frontend frameworks (Next.js, SvelteKit, Nuxt, Qwik,
SolidStart) without framework-specific wrappers.

## Decision drivers

- Framework-agnostic: vanilla JS API that takes a DOM element - no React/Vue/Svelte bindings required.
- Bundle size: minimal footprint since each framework app includes the library.
- Real-time performance: efficient incremental data updates without full re-renders.
- Time-series focus: the primary use case is time-series metric visualization.

## Considered options

### Option A

- Description: uPlot (~45KB, vanilla JS, canvas-based)
- Good, because smallest bundle size of all options.
- Good, because fastest canvas rendering - benchmarked for high-frequency updates.
- Good, because vanilla JS API - works with any framework via DOM ref.
- Good, because purpose-built for time-series data.
- Bad, because limited chart types (no pie, bar, etc. - time-series only).
- Bad, because minimal built-in styling - requires manual CSS for widget chrome.

### Option B

- Description: Chart.js (~60KB, canvas-based)
- Good, because well-known with large community.
- Good, because supports many chart types.
- Bad, because slower on frequent real-time updates compared to uPlot.
- Bad, because streaming plugin required for real-time data.
- Bad, because designed more for static charts with occasional updates.

### Option C

- Description: Vega-Lite + Vega + Vega-Embed (~285KB total)
- Good, because declarative JSON spec - chart definitions could live in shared package.
- Good, because supports any chart type.
- Bad, because ~6x bundle size compared to uPlot.
- Bad, because Vega-Lite compiles to Vega spec at runtime (cannot run without Vega runtime).
- Bad, because real-time updates require Vega changeset API - less straightforward than `setData()`.
- Bad, because overkill for three widgets.

### Option D

- Description: Apache ECharts (~400KB, tree-shakeable)
- Good, because rich dashboard-oriented feature set.
- Good, because framework-agnostic.
- Bad, because largest bundle even with tree-shaking.
- Bad, because complex API for simple time-series use case.

## Decision outcome

Chosen option: "Option A: uPlot", because it has the smallest bundle size, fastest real-time rendering, and a vanilla
JS API that works identically across all five frontend frameworks. The limitation to time-series charts is acceptable
since all three telemetry metrics are time-series data. Big number and counter widgets are plain styled HTML - no
charting library needed for those.

### Positive consequences

- ~45KB added to each framework app bundle (vs 285KB+ for alternatives).
- `uPlot.setData()` provides efficient incremental updates for real-time metrics.
- Same initialization code works in React refs, Svelte actions, Vue onMounted, Qwik useVisibleTask, and Solid onMount.
- No framework-specific wrapper libraries to maintain.

### Negative consequences

- If F4 (Chart) needs non-time-series chart types (pie, bar), a second library may be needed.
- Sparkline widget requires custom uPlot config (hidden axes, minimal chrome).
- No declarative API - chart setup is imperative JS in each framework.

## Links

- Related ADRs: ADR-010 (OTLP telemetry format - data source for charts)
- After-action review: 2026-03-21
