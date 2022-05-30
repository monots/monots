---
'load-esm-config': minor
---

```ts
declare function loadEsmFile(filepath: string): LoadEsmFileResult;
```

Add `loadEsmFile()` which loads all exports from a file. This is also used internally to load the configuration object.

Also export `ExportedConfig<Config, Argument>` type which allows exported configurations to be a function and a promise.
