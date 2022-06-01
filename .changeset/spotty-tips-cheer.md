---
'load-esm-config': minor
---

Add new property `exportKeys` to control which export `loadEsmConfig()` uses in `esm` or `cjs` environments.

```ts
// Default Value
{ esm: ['default'], cjs: ['', 'default'] }
```

```ts
import { loadEsmConfig } from 'load-esm-config';

const result = await loadEsmConfig({
  name: 'awesome',
  exportKeys: {
    esm: ['default', 'config'],
    cjs: ['', 'config'],
  },
});
```
