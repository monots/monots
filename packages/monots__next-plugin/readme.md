# @monots/next-plugin

> A [Next.js](https://nextjs.org/) plugin to make Next sites work with `monots prepare`

## Install

```bash
yarn add @monots/next-plugin
```

## Motivation

Next.JS doesn't automatically work with `monots prepare` and you will see cryptic errors when running on the server.

This plugin ensures that files are transpiled without requiring a build.

## Usage

Add the plugin to your `next.config.js` file.

```js
const withMonots = require('@monots/next-plugin');
module.exports = withMonots({ ...yourOwnConfig });
```
