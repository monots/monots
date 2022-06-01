---
'@monots/core': minor
---

Add the new config loading and defining functions.

```ts
declare function defineConfig(config: MonotsConfig): MonotsConfig;
```

Load the configuration from the root `monots.config.ts` file.

```ts
declare function loadConfig(): Promise<MonotsConfig>;
```
