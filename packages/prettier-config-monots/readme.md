# prettier-config-monots

> This package provides the default prettier configuration used within the monots codebase.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/prettier-config-monots
[npm]: https://npmjs.com/package/prettier-config-monots
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=prettier-config-monots
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/prettier-config-monots
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/prettier-config-monots/red?icon=npm

## Installation

```bash
yarn add prettier-config-monots
```

## Usage

In your `package.json` files add the following configuration

```json
{
  "name": "my-cool-library",
  "version": "0.0.0",
  "prettier": "prettier-config-monots"
}
```

If you don't want to use `package.json`, you can use any of the [supported prettier extensions](https://prettier.io/docs/en/configuration.html) to export a string, e.g. `.prettierrc.json`:

```json
"prettier-config-monots"
```

If you would like to extend the provided configuration with your own tweaks you will need to import this project into your own `.prettierrc.js` file and export the modifications.

```js
module.exports = {
  ...require('prettier-config-monots'),
  semi: false,
};
```
