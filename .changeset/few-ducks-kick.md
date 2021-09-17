---
'@monots/core': minor
'@monots/cli': minor
---

The `exports` field in the `package.json` generated when running `monots fix` now also generates paths ending with `.js`.

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
