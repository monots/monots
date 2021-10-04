---
'superstruct-extra': minor
---

Create a new package which adds a host of useful types to `superstruct`.

- `promise()` - for adding promise values which can be verified.
- `fn()` - for typed function declarations.
- `bigint()` - add support for `bigint`.
- `args()` - create args for the `fn` type.
- `nullish()` - add support for `null | undefined`. This can also be used for `void` types when creating `fn` schema.
- `nonempty()` - refine arrays, strings, tuples and maps to ensure they are nonempty.
- `email()` - refine a string as an email - this comes with a special `Email` type based on annotating the string type.
- `uuid()` - refine a string as a uuid.
- `readonly()` - refine iterables and object to be `readonly`. This doesn't perform any client side enforcement of readonly properties, since that would be expensive and there are many workarounds.
