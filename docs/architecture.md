# Studio Admin architecture

## Technology baseline

- Next.js 16 App Router.
- React 19.
- React Server Components by default.
- TypeScript strict mode.
- Tailwind CSS v4.
- shadcn/ui local primitives using `radix-nova`.
- React Hook Form and Zod for forms.
- TanStack Table for advanced tables.
- Zustand for genuinely shared client state.
- Biome for formatting, linting, and import organization.
- npm and `ts-node` for repository scripts.

Installed framework documentation and local component source are authoritative.

## Repository map

```text
src/
├── app/
│   ├── (external)/
│   ├── (main)/
│   │   └── dashboard/
│   │       ├── _components/
│   │       ├── (legacy)/
│   │       └── <feature>/
│   │           ├── _components/
│   │           ├── _schemas/
│   │           ├── loading.tsx
│   │           ├── error.tsx
│   │           └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/
│   └── calendar/
├── config/
├── data/
├── hooks/
├── lib/
├── navigation/
│   └── sidebar/sidebar-items.ts
├── scripts/
├── server/
├── stores/
└── styles/
    └── presets/
```

Root-level `scripts/` contains AI-friendly scaffolding and validation tooling. Existing
theme-generation scripts remain in `src/scripts/`.

## Dependency direction

Allowed:

```text
route -> own private code
route -> shared dashboard components
route -> shared application components
route -> public server/domain API
route -> hooks and lib

feature client component -> own private modules
feature client component -> shared components/ui
feature client component -> shared hooks and lib

server/domain -> lib
shared component -> components/ui, hooks, lib
components/ui -> lib
```

Forbidden:

```text
server/domain -> app route
lib -> app route
shared primitive -> business feature
feature A -> feature B private code
new route -> legacy route internals
```

## Ownership rules

### Route pages

`page.tsx` owns:

- Server-side authentication and authorization.
- Initial data loading.
- URL search-parameter parsing.
- Page-level composition.
- Route metadata when needed.

It does not own large presentational trees or browser interaction logic.

### Route-private code

Use the owning route's private directories:

```text
_components/
_schemas/
_data/
_lib/
```

Create only the directories the feature requires.

### Shared dashboard code

`src/app/(main)/dashboard/_components/` is for dashboard-shell-specific components used by
multiple dashboard routes.

### Shared application code

`src/components/` is for stable application-wide components with at least two concrete
consumers.

### Protected primitives

`src/components/ui/` and `src/components/calendar/` are protected local primitives.
Feature code composes them without changing their internals.

A primitive change requires explicit impact analysis across every consumer.

## Server and Client Components

Server Components own:

- Authentication and authorization.
- Initial queries.
- Secrets and transport clients.
- Cache and revalidation decisions.
- Parsing shareable URL state.
- Composition.

Client Components own only the smallest interactive island requiring:

- Event handlers.
- Browser APIs.
- Local interaction state.
- Client-only hooks.
- Drag and drop.
- Imperative chart, editor, or calendar APIs.

Pass serializable, minimal props across the boundary. Prefer view models over raw transport
responses.

## Data architecture

For derived products with real data:

- Validate input and external responses at trust boundaries.
- Enforce authorization on every server mutation and protected query.
- Keep secrets and transport clients out of Client Components.
- Normalize transport responses into typed domain or view models.
- Keep cache and revalidation decisions close to server queries.
- Normalize server errors into stable, UI-safe results.
- Do not duplicate server data into Zustand without an explicit requirement.

A domain server module should prefer:

```text
src/server/<domain>/
├── queries/
├── mutations/
├── schemas/
└── types.ts
```

Do not create a server layer solely to wrap static demo arrays.

## State ownership

Use this order:

1. Server/source-of-truth state.
2. URL state for shareable and navigable state.
3. Local component state for transient presentation.
4. Zustand only for shared client state without a better owner.

URL state includes page, sort, filters, search, and navigable tabs.

## Visual architecture

- Reuse the dashboard shell and layout controls.
- Use semantic CSS-variable tokens.
- Match nearby current screens for spacing, density, typography, borders, and radius.
- Use Tailwind named colors only when no semantic token exists and the product explicitly
  requires a non-theme color.
- Do not copy raw colors from screenshots.
- Do not use legacy screens as visual references for new work.

## Accessibility architecture

Every feature defines:

- Semantic structure and heading order.
- Keyboard interaction.
- Focus behavior and restoration.
- Accessible names and descriptions.
- Error association and announcements.
- Disabled and pending semantics.
- Responsive reading and tab order.

Accessibility is part of acceptance and verification.

## Deterministic development

New structures are created through templates in `templates/` and generators in `scripts/`.

Repository structure is indexed into `docs/ai/generated-context.md`.

Architecture and navigation validators convert core conventions into executable quality
gates.

## Change ownership

- Stable product facts: `PROJECT.md`.
- Architecture: this document and ADRs.
- Reusable implementation recipes: `docs/patterns/`.
- Canonical references: `docs/ai/canonical-examples.yaml`.
- Current repository inventory: `docs/ai/generated-context.md`.
- Product-change requirements: supplied by the later development workflow.
