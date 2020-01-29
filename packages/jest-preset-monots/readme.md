# jest-preset-monots

> This package provides the default eslint configurations used within the monots codebase.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm]
[![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts)
![MIT License][license]

[version]: https://flat.badgen.net/npm/v/jest-preset-monots
[npm]: https://npmjs.com/package/jest-preset-monots
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=jest-preset-monots
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/jest-preset-monots
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/jest-preset-monots/red?icon=npm

## Installation

Firstly install the peer dependencies of this package.

```bash
# Firstly install the peer dependencies of this package
yarn add --dev jest ts-jest typescript

# Install the package
yarn add --dev jest-preset-monots
```

## Usage

In your `package.json` files add the following configuration

```json
{
  "name": "my-cool-library",
  "version": "0.0.0",
  "jest": {
    "preset": "jest-preset-monots"
  }
}
```

If you don't want to use `package.json`, you can use the
[supported jest configuration formats](https://jestjs.io/docs/en/configuration) and set the preset
`jest-config.js`:

```js
module.exports = {
  preset: 'jest-preset-monots',
};
```

## Motivation

This config is primarily for use within a `monots` repo. There are two
