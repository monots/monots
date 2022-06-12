---
'@monots/next-plugin': patch
---

Fix issue with loading `esbuild-register` in NextJS commonjs module scope. The loader now properly mocks the generated \*.cjs.js files.
