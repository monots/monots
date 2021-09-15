# @monots/cli

## 0.3.0

> 2021-09-15

### Minor Changes

- [`23e7a89`](https://github.com/monots/monots/commit/23e7a893bcaebe5896aa65cdd2860e3b56021305) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Support fully nested routes for entrypoints. For example you can now add `common/file/origin.ts` to your entrypoint and it can be consumed with `<PACKAGE_NAME>/common/file/origin` by end users. This was not possible before.

### Patch Changes

- [`e3b874d`](https://github.com/monots/monots/commit/e3b874da5ffffce37e8dd7e3024d2b1ef27880f9) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix a bug with creating nested entrypoints. Now it should support entrypoints which end in `index.{ts,tsx}`.

- Updated dependencies [[`e3b874d`](https://github.com/monots/monots/commit/e3b874da5ffffce37e8dd7e3024d2b1ef27880f9), [`23e7a89`](https://github.com/monots/monots/commit/23e7a893bcaebe5896aa65cdd2860e3b56021305)]:
  - @monots/core@0.3.0

## 0.2.1

> 2021-09-14

### Patch Changes

- [`19579f1`](https://github.com/monots/monots/commit/19579f1ae8a39539c8930069fb95c7ffaec0c667) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove unused dependency `@types/through2`.

## 0.2.0

> 2021-09-13

### Minor Changes

- [`afe1fa5`](https://github.com/monots/monots/commit/afe1fa5e1a19e89e12a2f2a4215de83d68cc6452) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Create a new package with `monots create --description 'Amazing package' @scoped/amazing`.

### Patch Changes

- Updated dependencies [[`afe1fa5`](https://github.com/monots/monots/commit/afe1fa5e1a19e89e12a2f2a4215de83d68cc6452)]:
  - @monots/core@0.2.0

## 0.1.1

> 2021-09-12

### Patch Changes

- [`8a66f2a`](https://github.com/monots/monots/commit/8a66f2ae6ad439e49275cbc75eac875f49e4f507) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix `bin` entrypoint to work for `esm` modules which require specific imports.

## 0.1.0

> 2021-09-12

### Minor Changes

- [`e4746634`](https://github.com/monots/monots/commit/e4746634cce0b3f844da1bf24c98dd9d0ab9135c) Thanks [@ifiokjr](https://github.com/ifiokjr)! - First release of `monots` packages.

### Patch Changes

- Updated dependencies [[`e4746634`](https://github.com/monots/monots/commit/e4746634cce0b3f844da1bf24c98dd9d0ab9135c)]:
  - @monots/core@0.1.0
  - @monots/types@0.1.0
