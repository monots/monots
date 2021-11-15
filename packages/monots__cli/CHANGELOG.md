# @monots/cli

## 0.10.0

> 2021-11-15

### Minor Changes

- [#30](https://github.com/monots/monots/pull/30) [`c23a07e`](https://github.com/monots/monots/commit/c23a07ed658b3769f2f3c8174f1993bc0c4c8d3a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Copy over `.` (dot) files when working with templates.

### Patch Changes

- [#30](https://github.com/monots/monots/pull/30) [`c23a07e`](https://github.com/monots/monots/commit/c23a07ed658b3769f2f3c8174f1993bc0c4c8d3a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Change `engines` field to only support node version with built in `esm` support.

## 0.9.0

> 2021-11-15

### Minor Changes

- [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Remove most dependencies from `@monots/cli` since this slows down installation (esbuild and swc still required).

### Patch Changes

- [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make template packages public by default in `@monots/cli` and `create-monots`.

* [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix broken release causing this error `Error: Dynamic require of "path" is not supported`.

## 0.8.0

> 2021-11-15

### Minor Changes

- [#22](https://github.com/monots/monots/pull/22) [`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Massive speed up to `@monots/cli` installation via bundling all dependencies. Now `npx @monots/cli <command>` is much more responsive.

* [#22](https://github.com/monots/monots/pull/22) [`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: Remove all entrypoints from `@monots/cli`. Now the package can only be consumed as a command line application.

### Patch Changes

- Updated dependencies [[`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387), [`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387)]:
  - @monots/core@0.9.0

## 0.7.0

> 2021-11-07

### Minor Changes

- [`71662dc`](https://github.com/monots/monots/commit/71662dc5ff77146e75eb7352951aafb3adcab0bf) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: Rename `baseTsConfig` and `packageTsConfigs` settings on the project `monots` config to `baseTsconfig` and `packageTsconfigs` for consistency.

* [`71662dc`](https://github.com/monots/monots/commit/71662dc5ff77146e75eb7352951aafb3adcab0bf) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for relative `baseTsconfig` path. Now all generated `tsconfig.json` files will reference the relative path.

### Patch Changes

- Updated dependencies [[`71662dc`](https://github.com/monots/monots/commit/71662dc5ff77146e75eb7352951aafb3adcab0bf), [`71662dc`](https://github.com/monots/monots/commit/71662dc5ff77146e75eb7352951aafb3adcab0bf)]:
  - @monots/core@0.8.0

## 0.6.1

> 2021-11-04

### Patch Changes

- [`6792284`](https://github.com/monots/monots/commit/67922843517993d1cd08a23e57065eb2a2835763) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Only build a package if it has `mode: "library"`.

- Updated dependencies [[`6792284`](https://github.com/monots/monots/commit/67922843517993d1cd08a23e57065eb2a2835763)]:
  - @monots/core@0.7.1

## 0.6.0

> 2021-11-04

### Minor Changes

- [`ae7ada2`](https://github.com/monots/monots/commit/ae7ada28cfce71b12ba21ac6ac43d35350bc5d89) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Only allow `library` mode projects to be referenced in package `tsconfig.json` files.

* [`ae7ada2`](https://github.com/monots/monots/commit/ae7ada28cfce71b12ba21ac6ac43d35350bc5d89) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Only packages with `mode: "library"` will update their json files.

### Patch Changes

- Updated dependencies [[`ae7ada2`](https://github.com/monots/monots/commit/ae7ada28cfce71b12ba21ac6ac43d35350bc5d89), [`ae7ada2`](https://github.com/monots/monots/commit/ae7ada28cfce71b12ba21ac6ac43d35350bc5d89)]:
  - @monots/core@0.7.0

## 0.5.1

> 2021-11-02

### Patch Changes

- [#17](https://github.com/monots/monots/pull/17) [`efdf1d2`](https://github.com/monots/monots/commit/efdf1d27f953fcdb94cf02a9b54463d2fb7de6b4) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix broken tsconfig generator when running the `monots fix` command.

- Updated dependencies [[`efdf1d2`](https://github.com/monots/monots/commit/efdf1d27f953fcdb94cf02a9b54463d2fb7de6b4)]:
  - @monots/core@0.6.1

## 0.5.0

> 2021-11-01

### Minor Changes

- [#14](https://github.com/monots/monots/pull/14) [`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `extraExports` and `sourceFolderName` to the `package.json` configuration object.

### Patch Changes

- Updated dependencies [[`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418), [`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418)]:
  - @monots/core@0.6.0
  - @monots/types@0.1.2

## 0.4.1

> 2021-10-05

### Patch Changes

- [`fe9dbda`](https://github.com/monots/monots/commit/fe9dbdacef0e4c489ad7166a3aba3ca4b147fef5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update color of error messages for `monots fix`.

- Updated dependencies [[`3ab8df5`](https://github.com/monots/monots/commit/3ab8df5588e9998370a70c2af41117f2a5554d0b), [`ce50bad`](https://github.com/monots/monots/commit/ce50badfe7cdb4509c73f489a8f40fcd3d56229b)]:
  - @monots/core@0.5.0

## 0.4.0

> 2021-09-17

### Minor Changes

- [`ee663e3`](https://github.com/monots/monots/commit/ee663e31b24a6e3cd80aa83fc24fe50f0ebe23c1) Thanks [@ifiokjr](https://github.com/ifiokjr)! - The `exports` field in the `package.json` generated when running `monots fix` now also generates paths ending with `.js`.

  - This means you can now choose between the following statements:

    ```js
    import exportWithExtension from '@scoped/pkg/index.js';
    import sameExportWithoutExtension from '@scoped/pkg';
    ```

  - The same applies to entrypoints:

    ```js
    import exportWithExtension from '@scoped/pkg/entrypoint.js';
    import sameExportWithoutExtension from '@scoped/pkg/entrypoint';
    ```

* [`bab8691`](https://github.com/monots/monots/commit/bab8691c3765bab0fb8853cf3fd663959049b3ca) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Support using template syntax in filenames. You can now create dynamically named template files with `<%= kebabCaseName %>.ts`

### Patch Changes

- Updated dependencies [[`ee663e3`](https://github.com/monots/monots/commit/ee663e31b24a6e3cd80aa83fc24fe50f0ebe23c1)]:
  - @monots/core@0.4.0

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
