---
'@monots/cli': patch
'@monots/core': patch
---

Fix a bug with creating nested entrypoints. Now it should support entrypoints which end in `index.{ts,tsx}`.
