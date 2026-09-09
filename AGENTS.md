# Studio Admin AI development contract

## Purpose

This repository is a reusable Next.js dashboard boilerplate and a source for derived
products. Agents must preserve its architecture, visual system, accessibility, and
deterministic development workflow.

Detailed rules live under `docs/`. This file contains only repository-wide instructions
that must always be loaded.

## Required context

Before planning or modifying product code, read:

1. `PROJECT.md`
2. `docs/architecture.md`
3. `docs/ai/project-map.yaml`
4. The applicable file under `docs/patterns/`
5. `docs/ai/canonical-examples.yaml`
6. The closest selected canonical example

Do not scan the entire repository without a concrete reason. Load the target feature,
direct dependencies, one applicable pattern, and no more than two canonical examples.

Before Next.js implementation, inspect the relevant installed documentation under
`node_modules/next/dist/docs/`.

Before shadcn/ui work, inspect `components.json` and the relevant local source under
`src/components/ui/`.

## Architecture invariants

- `page.tsx` remains a Server Component by default.
- Browser APIs, event handlers, and local interaction state belong in focused Client
  Components.
- Route-private components, schemas, data, and helpers stay with the owning route.
- Shared components require at least two concrete consumers.
- Features do not import another feature's private internals.
- `src/components/ui/` and `src/components/calendar/` are protected primitives.
- New work does not use routes under `(legacy)` as references.
- Server and utility layers do not depend on application routes.
- Use existing `@/` aliases.
- Use semantic theme tokens and existing layout primitives.
- Do not add arbitrary hex, RGB, HSL, or OKLCH values to feature code.
- Enforce authentication, authorization, and input validation at server trust boundaries.
- Represent shareable filtering, sorting, pagination, and tab state in the URL.
- Avoid `any`; use precise TypeScript types.

## Deterministic scaffolding

Do not invent route structures repeatedly. Use the repository generators:

```bash
npm run generate:feature -- <name>
npm run generate:feature -- <name> --nav
npm run generate:dashboard -- <name>
npm run generate:crud -- <plural-entity>
npm run generate:crud -- <plural-entity> --singular <singular-entity>
```

Navigation options: `--nav` registers a feature in the sidebar; dashboards register
by default unless `--no-nav` is passed; `--nav-group <Pages|Dashboards>`,
`--nav-icon <LucideExport>`, and `--nav-title <text>` control placement, icon, and
label. CRUD infers the singular name; pass `--singular` explicitly when inference
is insufficient or the domain name should be explicit
(e.g. `--singular inventory-item`).

Prefer repository generators over manually creating standard feature, dashboard, or
CRUD structures. Inspect the generated files, then implement approved business
behavior. Create those structures manually only when the existing generator cannot
represent the requested shape.

Inspect generated files before implementation. Modify the scaffold to satisfy the approved
product behavior, not to introduce speculative abstractions.

After structural scaffolding, regenerate AI context and validate:

```bash
npm run ai:context
npm run validate
```

## Canonical examples

Select examples from `docs/ai/canonical-examples.yaml`.

Record:

- The selected example ID.
- Why it applies.
- Intentional deviations.

Existing code is a reference, not an exception to current architecture rules.

## Required states

Implement applicable:

- Loading.
- Empty.
- No filter results.
- Error and retry.
- Pending and disabled.
- Permission denied.
- Long-content and overflow.
- Small and large viewport.
- Keyboard and focus behavior.
- Light and dark themes.

## Validation

During implementation, run focused checks. Before completion, run:

```bash
npm run validate
```

When repository structure changes, regenerate AI context:

```bash
npm run ai:context
```

A completion claim must include command evidence, skipped checks, and residual risks.

## Repository safety

Never:

- Push or rewrite Git history without explicit approval.
- Delete unrelated files.
- Read non-example environment files or expose secrets.
- Add a dependency without documenting why the existing stack is insufficient.
- Modify protected primitives for feature-specific requirements.
- Weaken validation to make an implementation pass.
