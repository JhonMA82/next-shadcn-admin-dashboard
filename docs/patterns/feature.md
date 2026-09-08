# Feature pattern

## Use when

Creating a bounded dashboard capability that is not specifically a dashboard overview or a
full CRUD module.

## Recommended structure

```text
src/app/(main)/dashboard/<feature>/
├── _components/
│   └── <feature>-overview.tsx
├── loading.tsx
├── error.tsx
└── page.tsx
```

Add `_schemas/`, `_data/`, or `_lib/` only when the feature requires them.

## Design checklist

Define:

- User outcome.
- Route and navigation placement.
- Permissions.
- Data source and freshness.
- Server/Client boundary.
- URL, local, and shared state.
- Required states.
- Accessibility behavior.
- Canonical example and deviations.

## Implementation rules

- Keep `page.tsx` server-first and composition-focused.
- Keep route-owned code private.
- Use current shared primitives.
- Do not create a shared abstraction without proven consumers.
- Validate external and user input at trust boundaries.
- Add navigation only when approved.

## Verification

Check functional behavior, loading, error, empty, permissions, responsive layout, theme,
keyboard access, and repository quality gates.
