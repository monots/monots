---
'@monots/utils': minor
---

Breaking change to `deepMerge` which now takes an array of object to merge followed by the options available via the `deepmerge` library.

- Add new `createDebugger` function to `@monots/utils` which creates a `debug` function with the given namespace.

- Add `normalizePath` function for creating a linux friendly path.
