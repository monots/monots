<p align="center">
  <a href="#">
    <img width="300" height="300" src="./.monots/assets/logo.svg" alt="svg logo from openmoji.org" title="SVG Logo from openmoji.org" />
  </a>
</p>

<p align="center">
  Supercharge your next <em>TypeScript</em> project.
</p>

<br />

<p align="center">
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#why"><strong>Why?</strong></a> ·
  <a href="#plans"><strong>Plans</strong></a> ·
  <a href="./docs/docs"><strong>Documentation</strong></a> ·
  <a href="./.github/contributing.md"><strong>Contributing</strong></a>
</p>

<br />

<p align="center">
  <a href="https://github.com/monots/monots/actions?query=workflow:ci">
    <img src="https://github.com/monots/monots/workflows/ci/badge.svg?branch=main" alt="Continuous integration badge for github actions" title="CI Badge" />
  </a>
</p>

<br />

## The problem

Starting a new project or library for TypeScript is tedious.

You need to think about the following things:

- **Structure**: How to structure the codebase?
- **Build**: What to use for the end to end build process for the declaration files, CommonJS and ES6 Modules?
- **Testing**: How should the code be tested?
- **Linting**: What code styles should be enforced?
- **Changelog**: What tools will you use for managing your changelog and indicating patches, features and breaking changes?
- **Releases**: How should manual and automated releases for GitHub and npm be handled?
- **Documentation**: How to intentionally write good documentation and ensure up to date?
- **Deployments**: How to deploy the documentation as a searchable and easy to navigate?
- **API Docs**: How to automatically generate API documentation from code comments?

This all becomes much harder when your project is a monorepo and needs to be composed of several smaller packages. It multiplies the complexities of each of these points and requires using a variety of tools to glue together your codebase.

Thankfully, the basic package management within a monorepo is a problem that has largely been solved by tools like yarn workspaces and lerna. Despite this, there's still all those other items that each developer embarking on a large project must solve.

## The solution

What we need is a toolkit that provides all of these building blocks out of the box. This is what `monots` wants to become. It provides you with a project template for your most ambitious Typescript library.

## Usage

The easiest way to get started with **monots** is by using `create-monots`. This CLI tool enables you to quickly start building a new **monots** project, with everything set up for you. You can create a new project using the default template, or by using one of the [official boilerplate](https://github.com/monots/examples). To get started, use the following command:

```bash
npm create monots
```

To create a new project with a specific name, you can send a name as an argument. For example, the following command will create a new project `awesome` in a folder with the same name:

```bash
npm create monots sideproject
```

Currently `create-monots` requires either a global installation of [`pnpm`](https://pnpm.io/installation) or [corepack](https://github.com/nodejs/corepack) to be installed and enabled.

If you are using a version of node lower than `16.9` then you will need to install it manually.

```bash
npm i -g corepack
```

And then enable corepack.

```bash
corepack enable
```

### Options

`create-monots` comes with the following options:

- **-e, --example [name]|[github-url]** - An example to bootstrap the app with. You can use an example name from the [monots examples repo](https://github.com/monots/examples) or a GitHub URL. The URL can use any branch and/or subdirectory.
- **--example-path &lt;path-to-example&gt;** - In a rare case, your GitHub URL might contain a branch name with a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar). In this case, you must specify the path to the example separately: `--example-path foo/bar`

### Why use `create-monots`?

`create-monots` allows you to create a new project within seconds. Additionally it comes with the following features.

- **Interactive Experience**: Running `npm create monots` (with no arguments) launches an interactive experience that guides you through setting up your project.
- **Zero Dependencies**: Initializing a project is as quick as one second. `create-monots` has zero dependencies.
- **Offline Support**: `create-monots` will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Support for Examples**: `create-monots` can bootstrap your application using an example from the **monots** examples collection (e.g. `npx create-monots --example api-routes`).
- **Tested**: The package is part of the **monots** monorepo and tested using the same integration test suite as **monots** itself, ensuring it works as expected with every release.
