# @monots/binary-install

> Install `.tar.gz` and `.zip` binary applications via npm

## Why

Provides a Binary class that allows you to download a tarball or zip containing a binary and extract it to the standard location for node binaries.

This is being used within the `@monots` namespace to provide the deno binary for the `@monots/plugin-deno` package.

## Installation

```bash
pnpm add @monots/binary-install
```

## Usage

```ts
#!/usr/bin/env node

import { Binary } = from '@monots/binary-install';
import os from 'node:os';

const windows = "x86_64-pc-windows-msvc";
const type = os.type();
const arch = os.arch();
const version = latest;
let target: string;

if (type === "Windows_NT" && arch === "x64") {
  target = windows;
} else {
  if (type === "Linux" && arch === "x64") {
    target = "x86_64-unknown-linux-musl";
  }

  if (type === "Darwin" ) {
    if (arch === "x64") {
      target = "x86_64-apple-darwin";
    } else if (arch === "arm64") {
      target = "aarch64-apple-darwin";
    }
  }
  else {
    target = "x86_64-apple-darwin";
  }
}

const binary = new Binary('deno', `https://github.com/denoland/deno/releases/${version}/download/deno-${target}.zip`)
binary.run();
```
