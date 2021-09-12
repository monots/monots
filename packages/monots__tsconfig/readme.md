# @monots/tsconfig

> Shared [tsconfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) for the monots project

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](./src/index.ts) ![MIT License][license]

[version]: https://flat.badgen.net/npm/v/@monots/tsconfig
[npm]: https://npmjs.com/package/@monots/tsconfig
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@monots/tsconfig
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@monots/tsconfig
[typescript]: https://flat.badgen.net/badge/icon/TypeScript/?icon=typescript&label&labelColor=blue&color=555555
[downloads-badge]: https://badgen.net/npm/dw/@monots/tsconfig/red?icon=npm

## Installation

```bash
yarn add -D @monots/tsconfig
```

## Usage

Copy the following into your `tsconfig.json` file.

```json
{
  "extends": "@monots/tsconfig",
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  },
  "exclude": ["**/dist/**"]
}
```
