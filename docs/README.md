# Moda - Multi-Framework TODO Application

**This is a learning project.** The goal is to cover as many frontend frameworks as practical by building the same app
in each. The app is a vehicle for learning, not the product.

## Frameworks

| App               | Framework            | Paradigm                | Status   |
| ----------------- | -------------------- | ----------------------- | -------- |
| `apps/nextjs`     | Next.js 16, React 19 | RSC + Server Actions    | existing |
| `apps/sveltekit`  | SvelteKit, Svelte 5  | Compiler, runes         | planned  |
| `apps/nuxt`       | Nuxt 3, Vue 3        | Composition API         | planned  |
| `apps/qwik`       | Qwik City            | Resumability            | planned  |
| `apps/solidstart` | SolidStart, Solid.js | Fine-grained reactivity | planned  |

## Scope

Each framework app is a tabbed interface with three independent features:

1. **Tasks** - TODO list with create, edit, complete, delete, filter. Per-user lists behind auth.
2. **Canvas** - collaborative whiteboard synced in real time across clients.
3. **Activity** - live chart of server-pushed data rendered in real time.

## Non-goals

- Product quality - app quality is irrelevant, framework comparison is the point
- Pixel-perfect consistency - functional parity is sufficient
- Backend optimization - backend is a means, not a learning target
- Deep-diving into one framework - breadth over depth

## Documentation

- [Design doc](design-doc.md) - architecture, API surface, integration patterns, ADR log
- [ADRs](adr/) - architecture decision records
