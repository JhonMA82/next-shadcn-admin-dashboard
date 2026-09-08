# ADR-002: Server-first rendering

- Status: Accepted
- Date: 2026-07-23

## Context

App Router pages can execute on the server, enforce access before rendering, and avoid
shipping unnecessary JavaScript. Marking entire pages as Client Components weakens these
advantages and expands the hydration boundary.

## Decision

Keep `page.tsx` and route composition as Server Components by default.

Create focused Client Components only for browser APIs, event handlers, client hooks, or
local interaction state.

## Consequences

- Server-only resources stay out of browser bundles.
- Authorization and initial loading remain close to the route.
- Interactive islands require explicit serializable props.
- Agents must identify Server/Client boundaries during design.
- `page.tsx` containing `"use client"` is an architecture error.

## Alternatives rejected

- Client pages by default.
- Global client providers for feature-local interaction.
- Browser-only fetching for data available securely on the server.
