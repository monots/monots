# superstruct-extra

> Extra types, refinements and coercions for [`superstruct`](https://docs.superstructjs.org/).

## Reason

Superstruct is a great library, but sometimes you need additional types.

This re-exports superstruct as well as the following additions.

- `promise()` - for adding promise values which can be verified.
- `fn()` - for typed function declarations.
- `bigint()` - add support for `bigint`.
- `args()` - create args for the `fn` type.
- `nullish()` - add support for `null | undefined`. This can also be used for `void` types when creating `fn` schema.
- `nonempty()` - refine arrays, strings, tuples and maps to ensure they are nonempty.
- `email()` - refine a string as an email - this comes with a special `Email` type based on annotating the string type.
- `uuid()` - refine a string as a uuid.
- `readonly()` - refine iterables and objects to be `readonly`. This doesn't perform any client side enforcement of readonly properties.
