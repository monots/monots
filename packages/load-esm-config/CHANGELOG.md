# load-esm-config

## 0.2.0

> 2022-05-30

### Minor Changes

- 04ba7ca: **BREAKING**: Rename `lookupFilesToRoot` option to `disableUpwardLookup`. The default is now for `loadEsmConfig` to search upward until it reaches the root directory. You can set this option to true to only search the provided working directory (`cwd`).

  **BREAKING**: Rename interface `LoadEsmConfig` to `LoadEsmConfigOptions`.

  Other changes:

  - Improved the readme for better npm documentation.
  - Refactored the code to be more readable.

### Patch Changes

- Updated dependencies [ecbcdf7]
  - @monots/utils@0.5.0

## 0.1.0

> 2022-05-27

### Minor Changes

- b807c2f: Add new package `load-esm-config` for loading a configuration written in **TypeScript** / **JavaScript** with support for both **CommonJS** and **ESModule** packages.

  ```ts
  import { loadEsmConfig } from 'load-esm-config';

  // Load the configuration file and the absolute path to the config file.
  const { config, path } = loadEsmConfig({ name: 'something' });
  ```

  By default it supports these extensions: `['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']`. It is also possible to limit support for extensions by passing the `extensions` property.

  Another feature allows you to load from custom configuration folders. By default `./` (current) and `.config/` folders will be searched for matching configuration files. In the example above both `something.config.ts` and `.config/something.config.mjs` are valid configuration locations. This optionality should help remove configuration file overload in top level Further configuration folders can be added via the `dirs` property.

### Patch Changes

- Updated dependencies [b807c2f]
- Updated dependencies [b807c2f]
  - @monots/utils@0.4.0
