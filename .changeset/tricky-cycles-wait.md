---
'load-esm-config': minor
---

**BREAKING**: Rename `lookupFilesToRoot` option to `disableUpwardLookup`. The default is now for `loadEsmConfig` to search upward until it reaches the root directory. You can set this option to true to only search the provided working directory (`cwd`).

**BREAKING**: Rename interface `LoadEsmConfig` to `LoadEsmConfigOptions`.

Other changes:

- Improved the readme for better npm documentation.
- Refactored the code to be more readable.
