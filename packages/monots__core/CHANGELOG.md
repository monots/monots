# @monots/core

## 0.12.1

> 2021-11-16

### Patch Changes

- Updated dependencies [[`a6bf7b3`](https://github.com/monots/monots/commit/a6bf7b36ecc27f03aabcd7db6c01ceb9ae8e6ea6)]:
  - @monots/utils@0.2.0

## 0.12.0

> 2021-11-16

### Minor Changes

- [#32](https://github.com/monots/monots/pull/32) [`16997a8`](https://github.com/monots/monots/commit/16997a8a66c4b2e7c46e249bdad262fbd1c5bb20) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: Extract utility methods into a new `@monots/utils` package.

  - `deepMerge`
  - `folderExists`
  - `fileExists`
  - `removeUndefined`
  - `getInstaller`
  - `copyTemplate`
  - `getPackageJson`
  - `unmangleScopedPackage`
  - `mangleScopedPackageName`

### Patch Changes

- Updated dependencies [[`16997a8`](https://github.com/monots/monots/commit/16997a8a66c4b2e7c46e249bdad262fbd1c5bb20)]:
  - @monots/utils@0.1.0

## 0.11.0

> 2021-11-15

### Minor Changes

- [#30](https://github.com/monots/monots/pull/30) [`c23a07e`](https://github.com/monots/monots/commit/c23a07ed658b3769f2f3c8174f1993bc0c4c8d3a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make sure to minify the build output for packages with `"mode": "cli"`. This will speed up `create-monots` and `@monots/cli`.

* [#30](https://github.com/monots/monots/pull/30) [`c23a07e`](https://github.com/monots/monots/commit/c23a07ed658b3769f2f3c8174f1993bc0c4c8d3a) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Copy over `.` (dot) files when working with templates.

## 0.10.0

> 2021-11-15

### Minor Changes

- [#25](https://github.com/monots/monots/pull/25) [`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Make `cli` builds with esbuild bundle for node rather than esm to avoid cryptic errors. Also the binary for `cli` packages now points to a `.cjs` file.

### Patch Changes

- Updated dependencies [[`1181e6e`](https://github.com/monots/monots/commit/1181e6e867c50b3b912ac6fe5131ea60361e3ea5)]:
  - @monots/types@0.1.3
  - superstruct-extra@0.1.3

## 0.9.0

> 2021-11-15

### Minor Changes

- [#22](https://github.com/monots/monots/pull/22) [`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Export `copyTemplate` which uses template variables to copy a directory to it's destination. It supports templates within files and also the filenames themeselves can be templated.

* [#22](https://github.com/monots/monots/pull/22) [`bee017f`](https://github.com/monots/monots/commit/bee017f0106ecf9704b5b09b2bce2c1d69c31387) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `"mode": "cli"` option which always points to the `index.ts` file and bundles it for consumption as one file. It means that consuming the cli is much quicker for end users as there are no external dependencies to install.

## 0.8.0

> 2021-11-07

### Minor Changes

- [`71662dc`](https://github.com/monots/monots/commit/71662dc5ff77146e75eb7352951aafb3adcab0bf) Thanks [@ifiokjr](https://github.com/ifiokjr)! - **BREAKING**: Rename `baseTsConfig` and `packageTsConfigs` settings on the project `monots` config to `baseTsconfig` and `packageTsconfigs` for consistency.

* [`71662dc`](https://github.com/monots/monots/commit/71662dc5ff77146e75eb7352951aafb3adcab0bf) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add support for relative `baseTsconfig` path. Now all generated `tsconfig.json` files will reference the relative path.

## 0.7.1

> 2021-11-04

### Patch Changes

- [`6792284`](https://github.com/monots/monots/commit/67922843517993d1cd08a23e57065eb2a2835763) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Only build a package if it has `mode: "library"`.

## 0.7.0

> 2021-11-04

### Minor Changes

- [`ae7ada2`](https://github.com/monots/monots/commit/ae7ada28cfce71b12ba21ac6ac43d35350bc5d89) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Only allow `library` mode projects to be referenced in package `tsconfig.json` files.

* [`ae7ada2`](https://github.com/monots/monots/commit/ae7ada28cfce71b12ba21ac6ac43d35350bc5d89) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Only packages with `mode: "library"` will update their json files.

## 0.6.1

> 2021-11-02

### Patch Changes

- [#17](https://github.com/monots/monots/pull/17) [`efdf1d2`](https://github.com/monots/monots/commit/efdf1d27f953fcdb94cf02a9b54463d2fb7de6b4) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix broken tsconfig generator when running the `monots fix` command.

## 0.6.0

> 2021-11-01

### Minor Changes

- [#14](https://github.com/monots/monots/pull/14) [`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `extraExports` and `sourceFolderName` to the `package.json` configuration object.

### Patch Changes

- [#14](https://github.com/monots/monots/pull/14) [`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Update minor dependencies.

- Updated dependencies [[`a4fb71d`](https://github.com/monots/monots/commit/a4fb71d409367c1c80df8e8a7ba5bbfbd0826418)]:
  - @monots/types@0.1.2
  - superstruct-extra@0.1.2

## 0.5.1

> 2021-10-14

### Patch Changes

- [`d356f30`](https://github.com/monots/monots/commit/d356f30bb990cbdfb5f84b39c85dbc4fe632ac60) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Minor dependency version upgrades.

- Updated dependencies [[`d356f30`](https://github.com/monots/monots/commit/d356f30bb990cbdfb5f84b39c85dbc4fe632ac60), [`d356f30`](https://github.com/monots/monots/commit/d356f30bb990cbdfb5f84b39c85dbc4fe632ac60)]:
  - superstruct-extra@0.1.1
  - @monots/types@0.1.1

## 0.5.0

> 2021-10-05

### Minor Changes

- [`3ab8df5`](https://github.com/monots/monots/commit/3ab8df5588e9998370a70c2af41117f2a5554d0b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Automatically set the TypeScript module type to `CommonJS` when the package.json has the property `"type": "commonjs"`.

* [`ce50bad`](https://github.com/monots/monots/commit/ce50badfe7cdb4509c73f489a8f40fcd3d56229b) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Use `superstruct-extra` instead of `superstruct` for additional types.

### Patch Changes

- Updated dependencies [[`1184b76`](https://github.com/monots/monots/commit/1184b76a9b45fe72126bc16f49f9997fca62b67b)]:
  - superstruct-extra@0.1.0

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

## 0.3.0

> 2021-09-15

### Minor Changes

- [`23e7a89`](https://github.com/monots/monots/commit/23e7a893bcaebe5896aa65cdd2860e3b56021305) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Support fully nested routes for entrypoints. For example you can now add `common/file/origin.ts` to your entrypoint and it can be consumed with `<PACKAGE_NAME>/common/file/origin` by end users. This was not possible before.

### Patch Changes

- [`e3b874d`](https://github.com/monots/monots/commit/e3b874da5ffffce37e8dd7e3024d2b1ef27880f9) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Fix a bug with creating nested entrypoints. Now it should support entrypoints which end in `index.{ts,tsx}`.

## 0.2.0

> 2021-09-13

### Minor Changes

- [`afe1fa5`](https://github.com/monots/monots/commit/afe1fa5e1a19e89e12a2f2a4215de83d68cc6452) Thanks [@ifiokjr](https://github.com/ifiokjr)! - Add `packagesFolder` option to the Project `monots` configuration options. The default value is still `packages`.

## 0.1.0

> 2021-09-12

### Minor Changes

- [`e4746634`](https://github.com/monots/monots/commit/e4746634cce0b3f844da1bf24c98dd9d0ab9135c) Thanks [@ifiokjr](https://github.com/ifiokjr)! - First release of `monots` packages.

### Patch Changes

- Updated dependencies [[`e4746634`](https://github.com/monots/monots/commit/e4746634cce0b3f844da1bf24c98dd9d0ab9135c)]:
  - @monots/types@0.1.0
