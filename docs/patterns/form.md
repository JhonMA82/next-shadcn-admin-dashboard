# Form pattern

## Libraries

Use React Hook Form and Zod unless an approved feature pattern establishes a stronger
alternative.

## Schema ownership

- Keep feature-specific schemas with the feature.
- Reuse a domain schema only when semantics are identical.
- Separate transport coercion from user-facing validation when necessary.
- Validate again at the server boundary.

## Required behavior

Define:

- Initial values.
- Dirty behavior.
- Pending submission.
- Field and form-level errors.
- Success feedback and navigation.
- Retry.
- Duplicate-submission protection.
- Unsaved-change behavior when required.
- Disabled fields and permissions.

## Server and client boundary

The interactive form is a Client Component. The page and initial data remain server-first.

The server mutation:

- Authenticates.
- Authorizes.
- Validates.
- Normalizes.
- Executes.
- Returns a stable UI-safe result.
- Revalidates or redirects as designed.

## Accessibility

- Every field has a label.
- Errors are associated with fields.
- Form-level errors receive focus or announcement.
- Required and disabled semantics are exposed.
- Keyboard submission and cancellation work.
- Destructive actions are clear.

## Verification

Test valid, invalid, server-error, unauthorized, pending, retry, and navigation behavior.
