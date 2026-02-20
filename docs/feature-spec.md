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

## Tab: Tasks (`/`)

### F1 - Task list

User sees a list of tasks fetched from the server.

Each task shows:
- Title
- Status badge
- Formatted creation date

Empty state shown when no tasks exist. Unauthenticated users see a different empty state message.
List is wrapped in a loading boundary (skeleton or spinner) while fetching.

**Integration:** `getTodos(params)` from `@rvct/shared`

**AC:**
- [ ] Task list renders on page load
- [ ] Each item shows title, status, and date
- [ ] Empty state is visible when list is empty
- [ ] Loading state is visible during fetch

---

### F2 - Pagination

User can page through tasks when total exceeds page size.

Previous/Next controls and page number indicators are visible below the list.
Active page is reflected in the URL (`?page[offset]=N` or equivalent).
Navigating pages updates the list without full page reload where the framework supports it.

**Integration:** `getTodos({ page: { limit, offset } })` - response includes `links.prev`, `links.next`, `meta.page.total`

**AC:**
- [ ] Pagination controls render when total > page size
- [ ] Clicking Next loads the next page
- [ ] Clicking Previous loads the previous page
- [ ] Current page is reflected in the URL
- [ ] Page reloading at a paginated URL shows the correct page

---

### F3 - Sort controls

User can sort tasks by field and direction.

Sort controls are visible above the task list.
Supported sort fields: `title`, `status`, `created_at`, `updated_at`.
Each field can be sorted ascending or descending.
Active sort is reflected in the URL.

**Integration:** `getTodos({ sort: "-created_at" })` - prefix `-` for descending

**AC:**
- [ ] Sort buttons are visible
- [ ] Clicking a sort field applies the sort to the list
- [ ] Clicking the same field toggles direction
- [ ] Active sort state is visible in the UI
- [ ] Active sort is reflected in the URL

---

### F4 - Create task

Authenticated user can create a new task via a form.

"New task" or "Create" button is visible only when the user is signed in.
Clicking it opens a form (modal or inline) with fields: `title` (required), `content` (optional).
On success the task appears in the list and the form closes.
On validation error the error is shown inline next to the relevant field.

**Integration:** `postTodos(data)` from `@rvct/shared` - wraps data in JSON:API envelope

**AC:**
- [ ] Create button is hidden when not authenticated
- [ ] Create button is visible when authenticated
- [ ] Form opens on button click
- [ ] Submitting valid data creates the task and updates the list
- [ ] Submitting invalid data shows field-level errors
- [ ] Form closes after successful submission

---

### F5 - Task detail

User can open a task to view its full content.

Clicking a task in the list opens a detail view (modal or separate page).
Detail view shows: title, full content, creation date.
Back navigation returns to the task list preserving scroll or page state if possible.

**Integration:** `getTodosId(id)` from `@rvct/shared`

**AC:**
- [ ] Clicking a task opens the detail view
- [ ] Detail view shows title, content, and date
- [ ] Back navigation returns to the list
- [ ] Navigating directly to the detail URL works (deep-linkable)

---

### F6 - Edit task

Authenticated user can edit an existing task they own.

Edit button visible on task detail view (or inline) only for the task owner.
Form pre-filled with current title and content.
On success the updated values are reflected immediately.

**Integration:** `patchTodosId(id, data)` from `@rvct/shared`

**AC:**
- [ ] Edit button visible only for task owner
- [ ] Form opens pre-filled with current values
- [ ] Submitting changes updates the task
- [ ] Updated values are visible after save without full reload

---

### F7 - Delete task

Authenticated user can delete a task they own.

Delete button visible on task detail view only for the task owner.
Confirmation step before deletion (dialog, confirm prompt, or explicit second click).
After deletion the task is removed from the list and user is returned to list view.

**Integration:** `deleteTodosId(id)` from `@rvct/shared`

**AC:**
- [ ] Delete button visible only for task owner
- [ ] Confirmation step before deletion
- [ ] Task is removed from list after deletion
- [ ] User is redirected to list view

---

## Tab: Canvas (`/canvas`)

### F8 - Collaborative whiteboard

User sees an Excalidraw canvas and can draw on it.

Canvas occupies the main content area.
Grid mode is enabled by default.
Multiple users can draw simultaneously.
User awareness (pointer positions or cursors) is shown for other connected users.

**Integration:** `getExcalidrawDocument(socket)` from `@rvct/shared`, `y-excalidraw` binding, `y-phoenix-channel` provider

**AC:**
- [ ] Excalidraw canvas renders on page load
- [ ] User can draw shapes, text, and lines
- [ ] A second browser session connected to the same canvas sees changes within ~500ms

---

### F9 - Real-time sync

Drawing changes made by one user appear on other connected users' canvases in real time.

Sync is powered by Yjs CRDT over a Phoenix WebSocket channel.
Conflicts are resolved automatically by Yjs - no user action required.
Pointer positions of other users are visible as awareness overlays.

**Integration:** Phoenix channel `canvas:{document_id}`, `y-phoenix-channel` provider, awareness protocol from `yjs`

**AC:**
- [ ] Two sessions open on `/canvas` - drawing in one appears in the other within ~500ms
- [ ] Pointer positions of remote users are visible
- [ ] Closing one session and reconnecting does not lose data

---

### F10 - Local persistence

Canvas state survives page reload.

State is stored locally via IndexedDB as a fallback for when the WebSocket is unavailable.
On reconnect, local state is merged with server state via Yjs.

**Integration:** `y-indexeddb` provider

**AC:**
- [ ] Drawing on canvas, then reloading the page, restores the previous state
- [ ] Working offline (WebSocket unavailable) still allows drawing; state syncs on reconnect

---

## Tab: Activity (`/activity`)

### F11 - Activity stream

User sees a chronological list of recent domain events (task created, task updated, etc.).

Each event shows: event type, relevant entity title, timestamp.
List is paginated or scrollable with infinite load.
Unauthenticated users can view the stream.

**Integration:** HTTP `GET /activity` (TBD - verify endpoint with `ash_framework` team), or Phoenix channel `activity:lobby`

**AC:**
- [ ] Activity list renders on page load
- [ ] Each event shows type, entity reference, and timestamp
- [ ] Creating a task on the Tasks tab causes a new event to appear

---

### F12 - Real-time activity updates

New events appear in the stream without manual refresh.

Stream is powered by server push via Phoenix channel subscription.
New events prepend to or insert into the list in chronological order.

**Integration:** Phoenix channel `activity:lobby`, subscribe to `new_event` or equivalent push message

**AC:**
- [ ] Activity page is open; user creates a task on another tab or browser window
- [ ] New event appears in the stream within ~2s without page reload

---

## Cross-cutting: Auth

### F13 - Sign-in

User can sign in with Google.

Sign-in button is visible in the navbar when the user is not authenticated.
Clicking initiates Google OAuth 2.0 with PKCE.
After successful sign-in, the user is returned to the home page and sees their identity reflected in the navbar.

**Integration:**
- PKCE: generate verifier locally, pass `code_challenge` to `PUBLIC_API_URL/auth/user/google`
- Code exchange: `POST AUTH_SERVICE_URL/auth/exchange` with `{ code, code_verifier }`
- Store JWT in httpOnly cookie (key: `auth_token`, TTL: 7 days)
- Callback route: `GET /auth/callback?code=...`

**AC:**
- [ ] Sign-in button is visible when not authenticated
- [ ] Clicking sign-in redirects to Google
- [ ] After Google approval, user is redirected back to the app and is authenticated
- [ ] Navbar reflects authenticated state (user identity or sign-out button)

---

### F14 - Sign-out

Authenticated user can sign out.

Sign-out button visible in navbar only when authenticated.
After sign-out, session cookie is cleared and user is returned to home as unauthenticated.

**Integration:** Delete `auth_token` cookie, redirect to `/`

**AC:**
- [ ] Sign-out button visible when authenticated
- [ ] After sign-out, user is unauthenticated
- [ ] Protected UI elements (e.g., create button) are hidden after sign-out

---

### F15 - Auth-gated UI

Certain UI elements are visible only to authenticated users.

The following require authentication:
- Create task button (`F4`)
- Edit task button (`F6`)
- Delete task button (`F7`)

**Integration:** Read `auth_token` cookie server-side; decode JWT to extract `userId`

**AC:**
- [ ] Create/Edit/Delete controls hidden when not authenticated
- [ ] Controls visible when authenticated
- [ ] Submitting a protected action without a valid session returns an error (not a crash)

---

## Status matrix

`✅` done - AC passes | `🚧` in progress | `❌` not started | `⬜` app not yet bootstrapped

| Feature | nextjs | sveltekit | nuxt | qwik | solidstart |
|---------|:------:|:---------:|:----:|:----:|:----------:|
| **Tasks** | | | | | |
| F1 Task list | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F2 Pagination | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F3 Sort controls | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F4 Create task | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F5 Task detail | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F6 Edit task | ❌ | ⬜ | ⬜ | ⬜ | ⬜ |
| F7 Delete task | ❌ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Canvas** | | | | | |
| F8 Whiteboard | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F9 Real-time sync | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F10 Local persistence | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Activity** | | | | | |
| F11 Activity stream | ❌ | ⬜ | ⬜ | ⬜ | ⬜ |
| F12 Real-time updates | ❌ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Auth** | | | | | |
| F13 Sign-in | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F14 Sign-out | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| F15 Auth-gated UI | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Integration reference

### Shared API client

All client apps import from `@rvct/shared`. Do not call the HTTP API directly.

| Method | HTTP | Used for |
|--------|------|----------|
| `getTodos(params?)` | `GET /todos` | F1, F2, F3 |
| `getTodosId(id)` | `GET /todos/:id` | F5 |
| `postTodos(data)` | `POST /todos` | F4 |
| `patchTodosId(id, data)` | `PATCH /todos/:id` | F6 |
| `deleteTodosId(id)` | `DELETE /todos/:id` | F7 |
| `getExcalidrawDocument(socket)` | WS | F8, F9, F10 |

### Phoenix WebSocket channels

| Channel | Used for |
|---------|----------|
| `canvas:{document_id}` | F8, F9, F10 |
| `activity:lobby` | F11, F12 |

### Auth cookies

| Cookie | Content | TTL |
|--------|---------|-----|
| `auth_token` | Signed JWT (HS256), subject `user?id=<uuid>` | 7 days |
| `pkce_verifier` | PKCE code verifier (random 128-char string) | 10 minutes |

### Environment variables

| Variable | Used for |
|----------|----------|
| `PUBLIC_API_URL` | Base URL for HTTP API and OAuth redirect |
| `AUTH_SERVICE_URL` | Token exchange endpoint |
| `JWT_SECRET` | Verify `auth_token` server-side |
