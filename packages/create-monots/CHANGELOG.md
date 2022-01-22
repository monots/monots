# create-monots

## 0.3.3

> 2022-01-22

### Patch Changes

- [`ab28a0d`](https://github.com/monots/monots/commit/ab28a0d1fbdf9736134358e67b223165ebac9f7d) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix chalk coloring after version update. Use `chalk-template` for templating.

## 0.3.2

> 2021-12-16

### Patch Changes

- [#37](https://github.com/monots/monots/pull/37) [`a9662ed`](https://github.com/monots/monots/commit/a9662ed2666f7cca7f993d08d9d31afb357bf272) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Upgrade dependencies.

* [#37](https://github.com/monots/monots/pull/37) [`a9662ed`](https://github.com/monots/monots/commit/a9662ed2666f7cca7f993d08d9d31afb357bf272) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix installed versions of internal packages used in the default `monots` template.

## 0.3.1

> 2021-11-16

### Patch Changes

- [#34](https://github.com/monots/monots/pull/34) [`a6bf7b3`](https://github.com/monots/monots/commit/a6bf7b36ecc27f03aabcd7db6c01ceb9ae8e6ea6) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add missing `--help` and `--version` flags for `create-monots` command.

* [#34](https://github.com/monots/monots/pull/34) [`a6bf7b3`](https://github.com/monots/monots/commit/a6bf7b36ecc27f03aabcd7db6c01ceb9ae8e6ea6) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make sure `.gitignore` and `.npmrc` are included in the generated project.

## 0.3.0

> 2021-11-16

### Minor Changes

- [#32](https://github.com/monots/monots/pull/32) [`16997a8`](https://github.com/monots/monots/commit/16997a8a66c4b2e7c46e249bdad262fbd1c5bb20) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Increase performance via `@monots/utils`. Build tooling from `@monots` core is not longer part of the distributed release.

## 0.2.0

> 2021-11-15

### Minor Changes

- [#30](https://github.com/monots/monots/pull/30) [`c23a07e`](https://github.com/monots/monots/commit/c23a07ed658b3769f2f3c8174f1993bc0c4c8d3a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Copy over `.` (dot) files when working with templates.

### Patch Changes

- [#30](https://github.com/monots/monots/pull/30) [`c23a07e`](https://github.com/monots/monots/commit/c23a07ed658b3769f2f3c8174f1993bc0c4c8d3a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Change `engines` field to only support node version with built in `esm` support.

## 0.1.2

> 2021-11-15

### Patch Changes

- [#28](https://github.com/monots/monots/pull/28) [`888ed97`](https://github.com/monots/monots/commit/888ed971bfd0c84a87a1bd32890e9dddb1ef9945) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add the `templates` folder to the published `create-monots` package.

## 0.1.1

> 2021-11-15

### Patch Changes

- [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make template packages public by default in `@monots/cli` and `create-monots`.

* [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix broken release causing this error `Error: Dynamic require of "path" is not supported`.

## 0.1.0

> 2021-11-15

### Minor Changes

- [#22](https://github.com/monots/monots/pull/22) [`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add a new package `create-monots` which can be used with `yarn create monots my-project` or `npx create-monots my-project`.
