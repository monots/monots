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

What we need is a toolkit that provides all of these building blocks out of the box. This is where `monots` steps into the picture. It provides you with a project template for your ambitious Typescript monorepo.

Throughout the rest of this readme documentation each point will be outlined with an explanation on how monots has positioned itself to provide an out of the box solution.

## Usage

### Installation

To get started you will need to install the command line interface.

```bash
# With Yarn
yarn global add @monots/cli

# With NPM
npm install --global @monots/cli
```

Once installed you will have access to the cli command `monots` or if you prefer it's shorter alias `mts`. For the remainder of the tutorial the shorter version `mts` will be used.
