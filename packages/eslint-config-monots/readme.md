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
    "extends": ["eslint-config-monots"]
  }
}
```

If you don't want to use your `package.json` file, you can use any of the [supported eslint configuration formats](https://eslint.org/docs/user-guide/configuring#configuration-file-formats) to export a string, e.g. `.eslintrc.json`:

```json
{
  "extends": ["eslint-config-monots"]
}
```

You can always add your own rules and disable any rules you don't like by adding a rules property to the configuration.

```js
module.exports = {
  ...require('eslint-config-monots'),
};
```

## Motivation

This config is primarily for use within a monots repo. At the moment it is very strict and aims to allow multiple people working on a project to all conform to the same standard.
