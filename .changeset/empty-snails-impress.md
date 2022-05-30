---
'@monots/config': minor
---

Add the new package for loading and defining the monots configuration.

```ts
declare function defineConfig(config: MonotsConfig): MonotsConfig;
```

Load the configuration from the root `monots.config.ts` file.

```ts
declare function loadConfig(): Promise<MonotsConfig>;
```
