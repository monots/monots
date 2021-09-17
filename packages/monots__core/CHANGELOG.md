# @monots/core

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
