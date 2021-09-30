# @monots/next-plugin

> A [Next.js](https://nextjs.org/) plugin to make Next sites work with `monots prepare`

## Install

```bash
yarn add @monots/next-plugin
```

## Motivation

Next.JS doesn't automatically transpile the Node JS modules

## Usage

Add the plugin to your `next.config.js` file.

```js
const withMonots = require('@monots/next-plugin');
module.exports = withMonots({ ...yourOwnConfig });
```

Under the hood this uses the `next-transpile-modules` plugin and automatically adds the internal packages being used by the next.js package.
