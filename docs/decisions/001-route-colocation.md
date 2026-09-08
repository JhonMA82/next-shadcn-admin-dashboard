# ADR-001: Route colocation

- Status: Accepted
- Date: 2026-07-23

## Context

Dashboard features frequently contain components, schemas, mock data, and interaction logic
that are not meaningful outside one route. Moving these files into global directories
increases discovery cost and creates accidental coupling.

## Decision

Keep feature-owned code inside the route subtree that owns it.

Use private directories such as:

```text
src/app/(main)/dashboard/<feature>/
├── _components/
├── _schemas/
├── _data/
└── _lib/
```

Shared code is promoted only after multiple concrete consumers exist.

## Consequences

- Feature boundaries are visible in the filesystem.
- Deleting or migrating a route is easier.
- Agents can load a smaller context window.
- Some local duplication is accepted until reuse is proven.
- Cross-feature imports into private directories are invalid.

## Alternatives rejected

- Global `features/` directory for all product code.
- Global component placement by default.
- Premature shared abstractions based on anticipated reuse.
