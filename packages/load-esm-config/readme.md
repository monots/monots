# load-esm-config

> Load configuration files written in TypeScript and JavaScript

## Why?

Tools like `vite` have popularized the idea of code as configuration within the JavaScript / TypeScript ecosystem. Some advantages of using TypeScript for are:

- increased flexibility around apis
- type-safety for users
- inline documentation for an enhanced learning process

This project is solely focused on automating the process of loading these configuration files. The configuration is searched from the provided `cwd` and loaded automatically.

- support for both commonjs and esm modules
- nested configuration folders (by default configuration can be located in the `.config` folder)

## Installation

```bash
pnpm add load-esm-config
```

## Usage

```ts
import { loadEsmConfig } from 'load-esm-config';

// Load the configuration file and the absolute path to the config file.
const result = loadEsmConfig({ name: 'something' });

// `result` is either undefined or an object with the following properties:
if (result) {
  const { config, path } = result;
}
```

By default it supports these extensions: `['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']`. It is also possible to limit support for extensions by passing the `extensions` property.

By default `./` (current) and `.config/` folders will be searched for matching configuration files. In the example above both `something.config.ts` and `.config/something.config.mjs` are valid configuration locations. This optionality should help remove configuration file overload in top level Further configuration folders can be added via the `dirs` property.

## API

### `loadEsmConfig`

<table><tr><td width="400px" valign="top">

### `LoadEsmConfigOptions`

These are the options that can be provided to the `loadEsmConfig` function.

</td><td width="600px"><br>

````ts
/**
 * @template Config - the type of configuration that will be loaded
 * @template Argument - the argument that is passed to the configuration if is
 * supports being called.
 */
export interface LoadEsmConfigOptions<Config extends object = object, Argument = unknown> {
  /**
   * The name of the configuration object to search for.
   *
   * ### Example
   *
   * The following will search for the files from the provided current working
   * directory.
   *
   * - `monots.config.js`
   * - `monots.config.ts`
   *
   * ```
   * await loadEsmConfig({name: 'monots'});
   * ```
   */
  name: string;

  /**
   * The directory to search from.
   *
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * The initial configuration which will be used to set the defaults for the
   * provided configuration.
   */
  config?: PartialDeep<Config>;

  /**
   * The extensions to support.
   *
   * @default ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']
   */
  extensions?: SupportedExtensions[];

  /**
   * The same level configuration directories which should also be searched.
   *
   * The order of the directories determines the priority. By default
   * `.config/name.config.js` is preferred to `name.config.ts`.
   *
   * @default ['.config', '']
   */
  dirs?: string[];

  /**
   * If your configuration object supports being called with an argument, this
   * is used to generate the argument.
   *
   * It takes the options passed to `loadEsmConfig` and returns your desired
   * configuration.
   *
   * @default () => {}
   */
  getArgument?: (options: LoadEsmConfig<Config>) => Argument;

  /**
   * Overwrite the way certain properties are merged.
   *
   * @see https://github.com/TehShrike/deepmerge#custommerge
   */
  mergeOptions?: DeepMergeOptions;

  /**
   * By default the configuration file is searched from the provided working
   * directory, but if not found, each parent directory will also be searched,
   * all the way to the root directory.
   *
   * If this behaviour is not desired, set this to `false`.
   *
   * @default false
   */
  disableUpwardLookup?: boolean;
}
````

</td></tr></table>

<table><tr><td width="400px" valign="top">

### `interface LoadEsmConfigResult`

The value returned when calling `loadEsmConfig`. This will either be `undefined` or an object with the properties shown.

</td><td width="600px"><br>

```ts
interface LoadEsmConfigResult<Config extends object = any> {
  /**
   * The absolute path to the resolved configuration file.
   */
  path: string;

  /**
   * The configuration object that was loaded.
   */
  config: Config;

  /**
   * All the dependencies encountered while loading the file.
   */
  dependencies: string[];
}
```

</td></tr></table>

## Gratitude

This package is adapted from [vite](https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts). The work the vite developers are doing is outstanding and this package would not exist without their efforts.
