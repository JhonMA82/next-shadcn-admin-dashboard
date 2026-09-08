# CRUD feature pattern

## Use when

A domain entity needs list, create, view, edit, archive, delete, or status-change
capabilities.

CRUD is not automatically all operations. Scope each operation explicitly.

## Suggested structure

```text
src/app/(main)/dashboard/<entities>/
├── _components/
│   ├── <entity>-columns.tsx
│   ├── <entity>-form.tsx
│   └── <entity>-table.tsx
├── _data/
│   └── <entities>.ts
├── _schemas/
│   └── <entity>.ts
├── [id]/
│   └── edit/
│       └── page.tsx
├── new/
│   └── page.tsx
├── loading.tsx
├── error.tsx
└── page.tsx
```

The generated `_data/` module is a compile-ready placeholder. Replace it with the approved
server data boundary in real products.

## Functional contract

Specify:

- Entity identity and immutable fields.
- Operation permissions.
- Validation and normalization.
- Uniqueness and concurrency.
- Pagination, filtering, and sorting.
- URL persistence.
- Empty and no-result behavior.
- Destructive confirmation.
- Mutation feedback and retry.
- Audit requirements.

## Architecture

- List and edit pages remain server-first.
- Query parameters are validated before querying.
- Mutations validate and authorize on the server.
- Table interaction may be a Client Component.
- Feature columns and actions remain route-private.
- Transport responses do not flow directly into UI components.

## Verification

Include unauthorized operations, invalid input, duplicate/conflict behavior, empty data,
filter results, pagination boundaries, pending mutations, failure/retry, destructive
confirmation, and URL restoration.
