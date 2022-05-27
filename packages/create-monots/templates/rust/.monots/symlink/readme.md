# Config Files

All files in this folder will be symlinked to the root of the repository in the npm `preinstall` hook. This is to remove clutter when browsing the code on GitHub or other online tools.

This readme file is ignored though.

## Why

Opening a project only to be bombarded with a long list of files in the root directory can be intimidating. This folder helps to avoid that problem while retaining the functionality provided by these files.

Using symlinks that are added pre-installation allows for continued editing and updating of configuration files in the usual way.

## Content

- `.eslintignore` - The patterns to ignore when running `eslint` on the project.
- `.eslintrc.cjs` - The eslint rules for the whole project.
- `.lintagedrc` - Runs on every commit (see previous point) to make sure files are linted, prettified and don't fail any tests.
- `.prettierrc.cjs` - The configuration for [prettier](https://prettier.io/) which is responsible for formatting the project.
- `.commitlint.config.cjs` - The configuration for [prettier](https://prettier.io/) which is responsible for formatting the project.
- `tsconfig.json` - Automatically generated typescript configuration reference file.
- `vite.config.ts` - The vite configuration with `vitest` section.
