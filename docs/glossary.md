# Glossary

## Boilerplate

The reusable Studio Admin source repository from which product repositories are created.

## Derived project

A product repository generated from the boilerplate with its own `PROJECT.md`, package
identity, and source metadata.

## Feature

A bounded product capability owned by one route or a closely related route subtree.

## Route-private code

Components, schemas, helpers, and data owned by one route. It lives under private
directories such as `_components/`, `_schemas/`, `_data/`, or `_lib/`.

## Shared dashboard component

A component used by multiple dashboard routes but coupled to the dashboard shell or
dashboard information architecture.

## Shared application component

A stable component used across multiple application areas.

## Protected primitive

A local shadcn or calendar component whose internal implementation must not be changed for
a feature-specific requirement.

## Server Component

A React component rendered on the server and allowed to access server-only resources. It
is the default for App Router pages.

## Client Component

A component marked with `"use client"` because it requires browser behavior, event
handlers, or client hooks.

## Trust boundary

A point where external or user-controlled data enters the system and must be validated,
authorized, and normalized.

## URL state

Shareable and navigable UI state represented in query parameters or route segments.

## Canonical example

An approved current implementation selected as a reference for a specific pattern.

## Legacy route

A route under `(legacy)` maintained for compatibility or demonstration, not for new
implementation reference.

## Scaffold

Compile-oriented files generated from deterministic templates before business-specific
implementation.

## Architecture invariant

A repository-wide rule enforced by documentation, generators, validators, or all three.

## ADR

Architecture Decision Record: a durable document explaining a significant technical
decision, its context, consequences, and alternatives.

## Generated context

A machine-generated repository inventory used by AI agents to avoid repeatedly scanning
the entire codebase.

## Quality gate

A command that must pass before work can be considered complete.

## Full profile

A derived project profile that keeps all showcase routes and canonical examples.

## Minimal profile

A derived project profile that keeps one current default dashboard, removes known demo
routes, and resets navigation and canonical examples.
