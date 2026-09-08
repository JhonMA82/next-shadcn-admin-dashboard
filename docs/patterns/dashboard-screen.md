# Dashboard screen pattern

## Use when

Creating a new overview, analytics, operational, or executive dashboard.

## Recommended structure

```text
src/app/(main)/dashboard/<dashboard>/
├── _components/
│   ├── <dashboard>-header.tsx
│   ├── <dashboard>-kpis.tsx
│   └── <dashboard>-activity.tsx
├── loading.tsx
├── error.tsx
└── page.tsx
```

## Information design

Define before choosing widgets:

- Primary user question.
- Decision supported by the screen.
- Information hierarchy.
- Data freshness.
- Primary action.
- Responsive collapse order.
- Chart alternatives and textual context.

Avoid a uniform card grid when information importance differs.

## Architecture

- `page.tsx` loads and composes server data.
- Interactive charts, filters, or controls are focused Client Components.
- Route-private widgets remain under `_components/`.
- Dashboard-wide shell elements require multiple consumers before promotion.

## Required states

- Loading with stable layout.
- No data.
- Partial data.
- Query or integration failure.
- Permission denied.
- Long labels and large values.
- Small and large viewports.
- Light and dark themes.

## Verification

Confirm heading hierarchy, visual priority, responsive order, keyboard access, chart
labels, route registration, and no Client directive in `page.tsx`.
