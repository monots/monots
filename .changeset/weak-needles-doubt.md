---
'@monots/core': minor
---

Add `"mode": "cli"` option which always points to the `index.ts` file and bundles it for consumption as one file. It means that consuming the cli is much quicker for end users as there are no external dependencies to install.
