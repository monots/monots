# @monots/preset-core

> A collection of the core plugins used to manage monorepos with monots

## Why?

In order to compose monorepo functionality in monots there are certain core features that can be used by all environments.

This preset provides the core functionality for the following events.

- `create` - run when a library is being created.
- `prepare` - a command that is run in the `npm` prepare hook which prepares the environment for general usage.
- `build` - library builds which are suitable for release (e.g. production).
- `lint` - provide the functionality for performing checks on the validity of the libraries.
- `fix` - similar to `lint` but also provides fixes for issues raised during linting.
- `docs` - called when documentation is being generated for libraries.
- `change` - manages the generation of changesets which are used for providing information to changelogs.
- `release` - manages releases.
- `preview` - preview the changes that will be made by the `generate` action
- `generate` - plugins can manage configuration files - this tool generates them

Plugins can use these events, to orchestrate the different phases of library management. These events can also be extended and new events created.

## Installation

This preset is included by default in all monots variants.

```bash
pnpm add @monots/preset-core
```

## Usage

The `corePreset` function is already included in all other presets so you will never need to use it directly.

```ts
import { corePreset } from '@monots/preset-core';
import { defineConfig } from '@monots/core';

export default defineConfig({
  plugins: [corePreset({})],
});
```
