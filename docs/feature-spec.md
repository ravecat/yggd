# Feature Spec - Moda

## Metadata

- Scope: All client apps (`nextjs`, `sveltekit`, `nuxt`, `qwik`, `solidstart`)
- Reference implementation: `apps/nextjs`
- Related: [delivery-plan.md](delivery-plan.md), [design-doc.md](design-doc.md)

## Purpose

Single source of truth for what every client app must implement to reach parity. Each feature has an ID, behavioral
acceptance criteria, and integration hints. An agent implementing an app works through features top to bottom, checks
the box when AC passes, and updates the status matrix.

## How to use

1. Pick a target app.
2. Work through features in order within each section.
3. When a feature is unclear, read the reference implementation in `apps/nextjs`.
4. Check the box when AC passes end-to-end (not just when code compiles).
5. Update the status matrix at the bottom.

Do not skip features. Order within a section matters - later features build on earlier ones.

---

## F0 - Global

Cross-cutting features shared across all pages.

### F0.1 - Authentication

Sign-in / sign-out via Google OAuth 2.0 with PKCE.

Sign-in button visible in navbar when not authenticated. Sign-out button visible when authenticated. Auth-gated UI
elements (create, edit, delete) hidden for unauthenticated users.

**Integration:**

- PKCE: generate verifier locally, pass `code_challenge` to `PUBLIC_API_URL/auth/user/google`
- Code exchange: `POST AUTH_SERVICE_URL/auth/exchange` with `{ code, code_verifier }`
- JWT stored in httpOnly cookie (`auth_token`, TTL: 7 days)
- Callback route: `GET /auth/callback?code=...`

**AC:**

- [ ] Sign-in button visible when not authenticated
- [ ] Google OAuth flow completes and returns authenticated user
- [ ] Navbar reflects authenticated state
- [ ] Sign-out clears session and returns to unauthenticated state
- [ ] Auth-gated controls hidden when not authenticated

---

### F0.2 - Framework switching

User can switch between client framework implementations. Each app is served on a subdomain (e.g.
`nextjs.moda.ravecat.io`, `sveltekit.moda.ravecat.io`). A dropdown in the navbar lists available frameworks and
indicates the current one.

**AC:**

- [ ] Lists all available framework apps
- [ ] Current framework is indicated
- [ ] Selecting an entry navigates to the corresponding subdomain

---

### F0.3 - Navbar page switching

User can navigate between pages (Tasks, Canvas, Telemetry, Chart) via tabs in the navbar.

Active tab is visually highlighted. Navigation does not cause full page reload where framework supports it.

**AC:**

- [ ] Clicking a tab navigates to the corresponding page
- [ ] Active tab visually indicated based on current route

---

## F1 - Tasks (`/`)

**Page brief**

- What: Fixed task board grouped by workflow status.
- Why: Provide a clear operational surface for creating, prioritizing, and tracking work.
- Built with: JSON:API over HTTP via `@rvct/shared`, board grouping by `status`.

> **Protocol:** JSON:API - all HTTP operations follow the [JSON:API](https://jsonapi.org/) specification.

User sees tasks fetched from the server in a fixed board grouped by status. Columns are predefined: `todo`,
`in_progress`, `in_review`, `completed`. Each task card shows title, priority, and formatted creation date. Empty state
shown when no tasks exist. Unauthenticated users see a different empty state message. Loading state (skeleton or
spinner) while fetching.

**Integration:** `getTodos(params)` from `@rvct/shared`

**AC:**

- [ ] Task board renders on page load
- [ ] Board renders one column per allowed status (`todo`, `in_progress`, `in_review`, `completed`)
- [ ] Each card shows title, priority, and date
- [ ] Empty state visible when board is empty
- [ ] Loading state visible during fetch
- [ ] Empty columns are visible with zero-state placeholder

---

### F1.1 - Sort by updated_at

User can sort tasks by `updated_at` field, ascending or descending.

**Integration:** `getTodos({ sort: "-updated_at" })` - prefix `-` for descending

**AC:**

- [ ] Sort by updated_at is available
- [ ] Clicking toggles direction
- [ ] Active sort reflected in URL

---

### F1.2 - Sort by status

User can sort tasks by `status` field, ascending or descending.

**Integration:** `getTodos({ sort: "status" })`

**AC:**

- [ ] Sort by status is available
- [ ] Clicking toggles direction
- [ ] Active sort reflected in URL

---

### F1.3 - Sort by priority

User can sort tasks by `priority` field, ascending or descending.

**Integration:** `getTodos({ sort: "priority" })`

**AC:**

- [ ] Sort by priority is available
- [ ] Clicking toggles direction
- [ ] Active sort reflected in URL

---

### F1.4 - Pagination

User can page through tasks when total exceeds page size.

Previous/Next controls and page indicators visible below the board. Active page reflected in URL (`?page[offset]=N`).

**Integration:** `getTodos({ page: { limit, offset } })` - response includes `links.prev`, `links.next`,
`meta.page.total`

**AC:**

- [ ] Pagination controls render when total > page size
- [ ] Next/Previous load correct pages
- [ ] Current page reflected in URL
- [ ] Direct URL navigation shows correct page

---

### F1.5 - Create task

Authenticated user can create a new task.

Form with fields: `title` (required), `content` (optional), `priority` (optional, default: `medium`). On success task
appears on board. On validation error, field-level errors shown.

**Integration:** `postTodos(data)` from `@rvct/shared` - JSON:API envelope

**AC:**

- [ ] Create button hidden when not authenticated
- [ ] Form opens on button click
- [ ] Valid submission creates task and updates board
- [ ] Invalid submission shows field-level errors

---

## F2 - Canvas (`/canvas`)

**Page brief**

- What: Multi-user collaborative whiteboard with shared state.
- Why: Support concurrent visual collaboration and quick ideation.
- Built with: Excalidraw + Yjs CRDT + Phoenix Channels (`canvas:{document_id}`).

> **Protocol:** AsyncAPI - real-time operations follow [AsyncAPI](https://www.asyncapi.com/) conventions over Phoenix
> WebSocket channels.

Collaborative whiteboard powered by Excalidraw + Yjs CRDT over Phoenix WebSocket channels.

Excalidraw canvas renders in the main content area with grid mode enabled. Multiple users can draw simultaneously with
real-time sync. Canvas state persists via IndexedDB and syncs on reconnect.

**Integration:**

- `getExcalidrawDocument(socket)` from `@rvct/shared`, `y-excalidraw`, `y-phoenix-channel`
- Phoenix channel `canvas:{document_id}`, `y-indexeddb` provider

**AC:**

- [ ] Excalidraw canvas renders on page load
- [ ] User can draw shapes, text, and lines
- [ ] Remote user cursors/pointers visible
- [ ] State survives page reload
- [ ] Offline drawing syncs on reconnect

---

## F3 - Telemetry (`/telemetry`)

**Page brief**

- What: Live runtime telemetry dashboard for BEAM and host metrics.
- Why: Monitor system behavior and detect regressions in near real time.
- Built with: Erlang `:telemetry` + `:os_mon`, OTLP JSON payloads, Phoenix Channels, uPlot.

> **Protocol:** AsyncAPI - real-time operations described via [AsyncAPI](https://www.asyncapi.com/) specification over
> Phoenix WebSocket channels.

BEAM runtime and host system metrics dashboard with real-time updates. Data pushed from server via Phoenix channel in
[OTLP JSON](https://opentelemetry.io/docs/specs/otlp/) format (OpenTelemetry Metrics Data Model + semantic conventions,
no SDK - see ADR-010). Backend collects metrics via Erlang `:telemetry` + `:os_mon`. Charts rendered via
[uPlot](https://github.com/leeoniya/uPlot) - vanilla JS, framework-agnostic, ~45KB. No persistence - dashboard shows a
rolling window from the moment the client connects.

Metrics:

- **CPU load average** (`system.cpu.load_average.1m`) - big number + sparkline
- **Memory usage** (`system.memory.usage`) - big number + sparkline, formatted as GB
- **BEAM process count** (`process.runtime.beam.process_count`) - big number + sparkline
- **BEAM memory** (`process.runtime.beam.memory.total`) - big number + sparkline, formatted as MB
- **WebSocket connections** (`phoenix.channel.connection.count`) - big number + sparkline

**Integration:**

- Phoenix channel `telemetry:metrics` - server pushes `metrics` event every 2s with OTLP JSON payload
- OTLP envelope: `resourceMetrics[0].scopeMetrics[0].metrics[]` - each metric has `name`, `unit`, `gauge.dataPoints`
- Client: join channel, parse OTLP, append to rolling buffer (300 points), `uPlot.setData(buffer)`

**AC:**

- [ ] Dashboard renders five metric widgets on page load
- [ ] CPU load average displays current value with sparkline
- [ ] Memory usage displays current value with sparkline, formatted as GB
- [ ] BEAM process count displays current value as big number with sparkline
- [ ] BEAM memory displays current value with sparkline, formatted as MB
- [ ] WebSocket connections widget shows current count with sparkline
- [ ] All metrics update in real-time without page refresh
- [ ] Connection loss shows a disconnected state; metrics resume on reconnect

---

## F4 - Chart (`/chart`)

**Page brief**

- What: Real-time crypto price chart for BTC and ETH.
- Why: Validate streaming UI updates and time-series rendering behavior.
- Built with: Binance miniTicker stream proxied through Phoenix Channel (`chart:prices`) + uPlot.

> **Protocol:** AsyncAPI - real-time operations over Phoenix WebSocket channels.

Live crypto price chart. Backend proxies the
[Binance miniTicker WebSocket stream](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-mini-ticker-stream)
via a Phoenix channel. Frontend renders real-time time-series charts for BTC and ETH with a sliding window buffer.

**Integration:**

- Phoenix channel `chart:prices` - server pushes raw `price_tick` payloads from Binance `24hrMiniTicker`
- Backend: WebSocket client connects to
  `wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker` and broadcasts events to channel
  subscribers
- Frontend: parses `E` (event time), `s` (symbol), and `c` (close price), then appends to a sliding window buffer
- Chart: uPlot renders one real-time chart per symbol

**AC:**

- [ ] Chart renders with BTC and ETH series on page load
- [ ] Prices update in real-time from Binance via Phoenix channel
- [ ] Chart uses a sliding window buffer for recent points
- [ ] Connection loss shows disconnected state; chart resumes on reconnect

---

## Status matrix

`✅` done | `⬜` not done

| Feature / AC                              | nextjs | sveltekit | nuxt | qwik | solidstart |
| ----------------------------------------- | :----: | :-------: | :--: | :--: | :--------: |
| **F0.1 Authentication**                   |  4/5   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sign-in button visible                    |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| OAuth flow completes                      |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Navbar reflects auth state                |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sign-out clears session                   |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Auth-gated controls hidden                |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F0.2 Framework switching**              |  1/3   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Lists all framework apps                  |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Current framework indicated               |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Navigates to corresponding subdomain      |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F0.3 Navbar page switching**            |  2/2   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Tab navigates to page                     |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Active tab indicated                      |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1 Tasks (fixed board by status)**      |  0/6   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Board renders on page load                |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Column per allowed status                 |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Card shows title, priority, and date      |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Empty state visible                       |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Loading state visible                     |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Empty columns show placeholder            |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1.1 Sort by updated_at**               |  3/3   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sort available                            |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Clicking toggles direction                |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sort reflected in URL                     |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1.2 Sort by status**                   |  3/3   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sort available                            |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Clicking toggles direction                |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sort reflected in URL                     |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1.3 Sort by priority**                 |  0/3   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sort available                            |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Clicking toggles direction                |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sort reflected in URL                     |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1.4 Pagination**                       |  4/4   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Controls render when total > page size    |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Next/Previous load correct pages          |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Current page reflected in URL             |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Direct URL shows correct page             |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1.5 Create task**                      |  4/4   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Create button hidden when unauthed        |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Form opens on click                       |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Valid submission creates task             |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Invalid submission shows errors           |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F2 Canvas**                             |  5/5   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Canvas renders on page load               |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Draw shapes, text, lines                  |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Remote cursors visible                    |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| State survives reload                     |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Offline drawing syncs on reconnect        |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F3 Telemetry**                          |  0/9   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Six metric widgets render                 |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| CPU load average + sparkline              |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Memory usage + sparkline (GB)             |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| BEAM process count big number + sparkline |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| BEAM memory + sparkline (MB)              |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| HTTP latency p50/p95 chart                |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| WebSocket connections + sparkline         |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Real-time updates without refresh         |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Disconnected state; resume on reconnect   |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F4 Chart**                              |  0/4   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| BTC + ETH chart renders                   |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Prices update real-time via channel       |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Sliding window buffer (~5 min)            |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| Disconnected state; resume on reconnect   |   ⬜   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |

---

## Integration reference

### Shared API client

All client apps import from `@rvct/shared`. Do not call the HTTP API directly.

| Method                          | HTTP                | Used for      |
| ------------------------------- | ------------------- | ------------- |
| `getTodos(params?)`             | `GET /todos`        | F1, F1.1-F1.4 |
| `getTodosId(id)`                | `GET /todos/:id`    | -             |
| `postTodos(data)`               | `POST /todos`       | F1.5          |
| `patchTodosId(id, data)`        | `PATCH /todos/:id`  | -             |
| `deleteTodosId(id)`             | `DELETE /todos/:id` | -             |
| `getExcalidrawDocument(socket)` | WS                  | F2            |

### Phoenix WebSocket channels

| Channel                | Used for |
| ---------------------- | -------- |
| `canvas:{document_id}` | F2       |
| `telemetry:metrics`    | F3       |
| `chart:prices`         | F4       |

### Auth cookies

| Cookie          | Content                                      | TTL        |
| --------------- | -------------------------------------------- | ---------- |
| `auth_token`    | Signed JWT (HS256), subject `user?id=<uuid>` | 7 days     |
| `pkce_verifier` | PKCE code verifier (random 128-char string)  | 10 minutes |

### Environment variables

| Variable           | Used for                                 |
| ------------------ | ---------------------------------------- |
| `PUBLIC_API_URL`   | Base URL for HTTP API and OAuth redirect |
| `AUTH_SERVICE_URL` | Token exchange endpoint                  |
| `JWT_SECRET`       | Verify `auth_token` server-side          |
