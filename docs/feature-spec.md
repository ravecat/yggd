# Feature Spec - Moda

## Metadata

- Scope: All client apps (`nextjs`, `sveltekit`, `nuxt`, `qwik`, `solidstart`)
- Reference implementation: `apps/nextjs`
- Related: [delivery-plan.md](delivery-plan.md), [design-doc.md](design-doc.md)

## Purpose

Single source of truth for what every client app must implement to reach parity.
Each feature has an ID, behavioral acceptance criteria, and integration hints.
An agent implementing an app works through features top to bottom, checks the box when AC passes,
and updates the status matrix.

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

Sign-in button visible in navbar when not authenticated.
Sign-out button visible when authenticated.
Auth-gated UI elements (create, edit, delete) hidden for unauthenticated users.

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

User can switch between client framework implementations.
Each app is served on a subdomain (e.g. `nextjs.moda.ravecat.io`, `sveltekit.moda.ravecat.io`).
A dropdown in the navbar lists available frameworks and indicates the current one.

**AC:**

- [ ] Framework dropdown visible in navbar
- [ ] Lists all available framework apps
- [ ] Current framework is indicated
- [ ] Selecting an entry navigates to the corresponding subdomain

---

### F0.3 - Navbar page switching

User can navigate between pages (Tasks, Canvas, Telemetry, Chart) via tabs in the navbar.

Active tab is visually highlighted. Navigation does not cause full page reload where framework supports it.

**AC:**

- [ ] Navbar tabs visible for all pages
- [ ] Clicking a tab navigates to the corresponding page
- [ ] Active tab visually indicated based on current route

---

## F1 - Tasks (`/`)

> **Protocol:** JSON:API - all HTTP operations follow the [JSON:API](https://jsonapi.org/) specification.

User sees a list of tasks fetched from the server.
Each task shows: title, status badge, priority, formatted creation date.
Status is an enum: `todo`, `in_progress`, `in_review`, `completed`.
Priority is an enum: `low`, `medium`, `high`, `urgent`.
Empty state shown when no tasks exist. Unauthenticated users see a different empty state message.
Loading state (skeleton or spinner) while fetching.

**Integration:** `getTodos(params)` from `@rvct/shared`

**AC:**

- [ ] Task list renders on page load
- [ ] Each item shows title, status, and date
- [ ] Empty state visible when list is empty
- [ ] Loading state visible during fetch

---

### F1.1 - Sort by updated_at

User can sort the task list by `updated_at` field, ascending or descending.

**Integration:** `getTodos({ sort: "-updated_at" })` - prefix `-` for descending

**AC:**

- [ ] Sort by updated_at is available
- [ ] Clicking toggles direction
- [ ] Active sort reflected in URL

---

### F1.2 - Sort by status

User can sort the task list by `status` field, ascending or descending.

**Integration:** `getTodos({ sort: "status" })`

**AC:**

- [ ] Sort by status is available
- [ ] Clicking toggles direction
- [ ] Active sort reflected in URL

---

### F1.3 - Sort by priority

User can sort the task list by `priority` field, ascending or descending.

**Integration:** `getTodos({ sort: "priority" })`

**AC:**

- [ ] Sort by priority is available
- [ ] Clicking toggles direction
- [ ] Active sort reflected in URL

---

### F1.4 - Pagination

User can page through tasks when total exceeds page size.

Previous/Next controls and page indicators visible below the list.
Active page reflected in URL (`?page[offset]=N`).

**Integration:** `getTodos({ page: { limit, offset } })` - response includes `links.prev`, `links.next`, `meta.page.total`

**AC:**

- [ ] Pagination controls render when total > page size
- [ ] Next/Previous load correct pages
- [ ] Current page reflected in URL
- [ ] Direct URL navigation shows correct page

---

### F1.5 - Create task

Authenticated user can create a new task.

Form with fields: `title` (required), `content` (optional), `priority` (optional, default: `medium`).
On success task appears in list. On validation error, field-level errors shown.

**Integration:** `postTodos(data)` from `@rvct/shared` - JSON:API envelope

**AC:**

- [ ] Create button hidden when not authenticated
- [ ] Form opens on button click
- [ ] Valid submission creates task and updates list
- [ ] Invalid submission shows field-level errors

---

## F2 - Canvas (`/canvas`)

> **Protocol:** AsyncAPI - real-time operations follow [AsyncAPI](https://www.asyncapi.com/) conventions over Phoenix WebSocket channels.

Collaborative whiteboard powered by Excalidraw + Yjs CRDT over Phoenix WebSocket channels.

**Integration:** `getExcalidrawDocument(socket)` from `@rvct/shared`, `y-excalidraw`, `y-phoenix-channel`

---

### F2.1 - Canvas integration

Excalidraw canvas renders in the main content area with grid mode enabled.
Multiple users can draw simultaneously with real-time sync.
Canvas state persists via IndexedDB and syncs on reconnect.

**Integration:** Phoenix channel `canvas:{document_id}`, `y-indexeddb` provider

**AC:**

- [ ] Excalidraw canvas renders on page load
- [ ] User can draw shapes, text, and lines
- [ ] Changes sync between sessions within ~500ms
- [ ] Remote user cursors/pointers visible
- [ ] State survives page reload
- [ ] Offline drawing syncs on reconnect

Specs TBD - additional sub-features to follow.

---

## F3 - Telemetry (`/telemetry`)

> **Protocol:** AsyncAPI - real-time operations described via [AsyncAPI](https://www.asyncapi.com/) specification over Phoenix WebSocket channels.

BEAM VM metrics dashboard with real-time updates.
Data pushed from server via Phoenix channel in [OTLP JSON](https://opentelemetry.io/docs/specs/otlp/) format (OpenTelemetry Protocol).
Backend collects metrics via `opentelemetry_erlang` SDK subscribed to Erlang `:telemetry` events.
Charts rendered via [uPlot](https://github.com/leeoniya/uPlot) - vanilla JS, framework-agnostic, ~45KB.

Metrics:

- **BEAM process count** - big number + sparkline underneath
- **HTTP request latency (p50/p95)** - line chart, two series, Y-axis in ms
- **Active WebSocket connections** - counter, numeric widget + trend

All metrics available via Erlang `:telemetry` out of the box.

**AC:**

- [ ] Dashboard renders three metric widgets on page load
- [ ] BEAM process count displays current value as big number with sparkline
- [ ] HTTP latency chart shows p50 and p95 as two distinct series
- [ ] WebSocket connections widget shows current count with trend indicator
- [ ] All metrics update in real-time without page refresh
- [ ] Connection loss shows a disconnected state; metrics resume on reconnect

Specs TBD - sub-features to follow.

---

## F4 - Chart (`/chart`)

Market data charts.

Specs TBD.

---

## Status matrix

`✅` done | `🚧` in progress | `❌` not started | `⬜` app not yet bootstrapped

| Feature                  | nextjs | sveltekit | nuxt | qwik | solidstart |
| ------------------------ | :----: | :-------: | :--: | :--: | :--------: |
| **F0 Global**            |        |           |      |      |            |
| F0.1 Authentication      |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F0.2 Framework switching |   🚧   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F0.3 Navbar switching    |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F1 Tasks**             |        |           |      |      |            |
| F1 Task list             |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F1.1 Sort by updated_at  |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F1.2 Sort by status      |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F1.3 Sort by priority    |   ❌   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F1.4 Pagination          |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| F1.5 Create task         |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F2 Canvas**            |        |           |      |      |            |
| F2.1 Canvas integration  |   ✅   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F3 Telemetry**         |        |           |      |      |            |
| F3 Telemetry             |   ❌   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |
| **F4 Chart**             |        |           |      |      |            |
| F4 Chart                 |   ❌   |    ⬜     |  ⬜  |  ⬜  |     ⬜     |

---

## Integration reference

### Shared API client

All client apps import from `@rvct/shared`. Do not call the HTTP API directly.

| Method                          | HTTP                | Used for       |
| ------------------------------- | ------------------- | -------------- |
| `getTodos(params?)`             | `GET /todos`        | F1, F1.1-F1.4  |
| `getTodosId(id)`                | `GET /todos/:id`    | -              |
| `postTodos(data)`               | `POST /todos`       | F1.5           |
| `patchTodosId(id, data)`        | `PATCH /todos/:id`  | -              |
| `deleteTodosId(id)`             | `DELETE /todos/:id` | -              |
| `getExcalidrawDocument(socket)` | WS                  | F2.1           |

### Phoenix WebSocket channels

| Channel                 | Used for |
| ----------------------- | -------- |
| `canvas:{document_id}`  | F2.1     |

### Auth cookies

| Cookie           | Content                                       | TTL        |
| ---------------- | --------------------------------------------- | ---------- |
| `auth_token`     | Signed JWT (HS256), subject `user?id=<uuid>`  | 7 days     |
| `pkce_verifier`  | PKCE code verifier (random 128-char string)   | 10 minutes |

### Environment variables

| Variable           | Used for                                 |
| ------------------ | ---------------------------------------- |
| `PUBLIC_API_URL`   | Base URL for HTTP API and OAuth redirect |
| `AUTH_SERVICE_URL` | Token exchange endpoint                  |
| `JWT_SECRET`       | Verify `auth_token` server-side          |
