---
'@monots/core': minor
'@monots/cli': minor
---

Add support for `ignoreExports` flag to the package configuration. Setting this flag to `true` will leave the package.json `exports` field untouched when running the following command.

```bash
monots fix
```
