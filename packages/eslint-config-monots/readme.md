# eslint-config-monots

> This package provides the default eslint configurations used within the monots codebase.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/eslint-config-monots
[npm]: https://npmjs.com/package/eslint-config-monots
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=eslint-config-monots
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/eslint-config-monots
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/eslint-config-monots/red?icon=npm

## Installation

```bash
yarn add eslint-config-monots
```

## Usage

In your `package.json` files add the following configuration

```json
{
  "name": "my-cool-library",
  "version": "0.0.0",
  "eslintConfig": {
    "extends": ["monots"],
    "overrides": [
      {
        "files": ["*.ts", "*.tsx"],
        "extends": ["monots/full"],
        "parserOptions": {
          "project": ["./path/to/tsconfig.lint.json"]
        }
      },
      { "files": ["*.tsx"], "extends": ["monots/react"] }
    ]
  }
}
```

If you don't want to use your `package.json` file, you can use any of the [supported eslint configuration formats](https://eslint.org/docs/user-guide/configuring#configuration-file-formats) to export a string, e.g. `.eslintrc.json`:

```json
{
  "extends": ["monots"]
}
```

You can always add your own rules and disable any rules you don't like by adding a rules property to the configuration.

```js
module.exports = {
  extends: ['monots'],
};
```

## Motivation

This config is primarily for use within a **`monots`** repo. Rules are strict but they do allow multiple people working on a project to conform to the same standard.

## Entrypoints

### `monots`

Provides the default rules and sets the parser to use `@typescript-eslint/parser`.

### `monots/full`

Provides stricter rules and the cpu intensive `@typescript-eslint/eslint-plugin` / `eslint-plugin-import` which should be scoped to `*.ts` files in your project.

### `monots/react`

Rules for a react codebase.

### `monots/markdown`

Experimental rules for markdown files. This currently doesn't interop well with `@typescript-eslint/parser` when the project option is set.

### `monots/full-off`

Can be used to disable the `full` rule for certain groups of files.

```js
module.exports = {
  extends: ['monots'],
  "overrides": [
      {
        "files": ["*.ts", "*.tsx"],
        "extends": ["monots/full"],
        "parserOptions": {
          "project": ["./path/to/tsconfig.lint.json"]
        }
      },
      { "files": ["*.tsx"], "extends": ["monots/react"] },

      // Disable the `full` rules for certain matching files.
      {"files": ["*.d.ts"], extends: ['monots/full-off'] }
    ]
  }
};
```
