---
'load-esm-config': minor
---

Add new package `load-esm-config` for loading a configuration written in **TypeScript** / **JavaScript** with support for both **CommonJS** and **ESModule** packages.

```ts
import { loadEsmConfig } from 'load-esm-config';

// Load the configuration file and the absolute path to the config file.
const { config, path } = loadEsmConfig({ name: 'something' });
```

By default it supports these extensions: `['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']`. It is also possible to limit support for extensions by passing the `extensions` property.

Another feature allows you to load from custom configuration folders. By default `./` (current) and `.config/` folders will be searched for matching configuration files. In the example above both `something.config.ts` and `.config/something.config.mjs` are valid configuration locations. This optionality should help remove configuration file overload in top level Further configuration folders can be added via the `dirs` property.
