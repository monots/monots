# superstruct-extra

## 0.1.5

> 2022-02-15

### Patch Changes

- [`f67dc68`](https://github.com/monots/monots/commit/f67dc686da9adfecddfdf767563110c226ce2e66) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update dependencies.

- Updated dependencies [[`f67dc68`](https://github.com/monots/monots/commit/f67dc686da9adfecddfdf767563110c226ce2e66)]:
  - @monots/types@0.1.6

## 0.1.4

> 2022-01-28

### Patch Changes

- [`5b863ff`](https://github.com/monots/monots/commit/5b863ffd92c567314eac2e18a21e97b4bb1b17e3) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Minor updates to external dependencies.

- Updated dependencies [[`5b863ff`](https://github.com/monots/monots/commit/5b863ffd92c567314eac2e18a21e97b4bb1b17e3)]:
  - @monots/types@0.1.5

## 0.1.3

> 2021-11-15

### Patch Changes

- [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - `patch` and `minor` updates to external dependencies.

- Updated dependencies [[`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5)]:
  - @monots/types@0.1.3

## 0.1.2

> 2021-11-01

### Patch Changes

- [#14](https://github.com/monots/monots/pull/14) [`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update minor dependencies.

- Updated dependencies [[`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418)]:
  - @monots/types@0.1.2

## 0.1.1

> 2021-10-14

### Patch Changes

- [`d356f30`](https://github.com/monots/monots/commit/d356f30bb990cbdfb5f84b39c85dbc4fe632ac60) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove `bigint` and `nonempty` structs which are now provided by `superstruct`.

- Updated dependencies [[`d356f30`](https://github.com/monots/monots/commit/d356f30bb990cbdfb5f84b39c85dbc4fe632ac60)]:
  - @monots/types@0.1.1

## 0.1.0

> 2021-10-05

### Minor Changes

- [`1184b76`](https://github.com/monots/monots/commit/1184b76a9b45fe72126bc16f49f9997fca62b67b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Create a new package which adds a host of useful types to `superstruct`.

  - `promise()` - for adding promise values which can be verified.
  - `fn()` - for typed function declarations.
  - `bigint()` - add support for `bigint`.
  - `args()` - create args for the `fn` type.
  - `nullish()` - add support for `null | undefined`. This can also be used for `void` types when creating `fn` schema.
  - `nonempty()` - refine arrays, strings, tuples and maps to ensure they are nonempty.
  - `email()` - refine a string as an email - this comes with a special `Email` type based on annotating the string type.
  - `uuid()` - refine a string as a uuid.
  - `readonly()` - refine iterables and object to be `readonly`. This doesn't perform any client side enforcement of readonly properties, since that would be expensive and there are many workarounds.
