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

## Worked example

Create a `reports` feature with sidebar navigation:

```bash
npm run generate:feature -- reports --nav
```

> The space after `--` matters: npm only forwards arguments placed after it.
> `npm run generate:feature --reports --nav` (no space) forwards nothing, so the
> generator prints its usage text and creates no files.

Expected outcome:

```text
src/app/(main)/dashboard/reports/
├── _components/
│   └── reports-overview.tsx
├── loading.tsx
├── error.tsx
└── page.tsx
```

- A `Reports` entry is added to the sidebar under the `Pages` group
  (`/dashboard/reports`, `SquareArrowUpRight` icon).
- `docs/ai/generated-context.md` is regenerated.
- The scaffold is intentionally minimal: implement the approved behavior in the
  generated files before adding abstractions.

## Scenarios

- **Approved navigation.** Use `--nav` as in the example when the route is
  approved for the sidebar. Without `--nav`, the route exists but is unreachable
  from navigation until registered.
- **Custom placement.** `--nav-group Dashboards --nav-icon ChartNoAxesColumn --nav-title "Team reports"`
  controls the sidebar group, icon, and label without touching generated code.
- **Documented intent.** `--description "Weekly exportable team activity."` seeds
  the generated overview copy with the approved outcome.
- **Name collision.** Re-running for an existing route fails instead of
  overwriting. Pass `--force` only when discarding the previous scaffold is
  intended.
- **Batch scaffolding.** Pass `--no-context` when generating several routes in a
  row, then run `npm run ai:context` once at the end.
- **Invalid name.** Names must be kebab-case (`reports`, not `Reports` or
  `team_reports`); the generator rejects anything else.
- **Wrong generator.** Prefer `generate:dashboard` for overview/analytics screens
  and `generate:crud` for entity list/create/edit flows. A feature that grows a
  second entity usually means a missing CRUD scaffold, not a bigger feature.

## Verification

Check functional behavior, loading, error, empty, permissions, responsive layout, theme,
keyboard access, and repository quality gates.
