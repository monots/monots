# monotos

## Table of Contents

- [monotos](#monotos)
  - [Table of Contents](#table-of-contents)
  - [The problem](#the-problem)
  - [The solution](#the-solution)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Commands](#commands)
    - [Docs](#docs)
    - [Alternatives](#alternatives)

TypeScript project management for monorepos.

## The problem

Starting a new project or library for TypeScript is tedious.

You need to think about the following things:

- **Structure**: How to structure the codebase?
- **Build**: What to use for the end to end build process for the declaration files, CommonJS and
  ES6 Modules?
- **Testing**: How should the code be tested?
- **Linting**: What code styles should be enforced?
- **Changelog**: What tools will you use for managing your changelog and indicating patches,
  features and breaking changes?
- **Releases**: How should manual and automated releases for GitHub and npm be handled?
- **Documentation**: How to intentionally write good documentation and ensure up to date?
- **Deployments**: How to deploy the documentation as a searchable and easy to navigate?
- **API Docs**: How to automatically generate API documentation from code comments?

This all becomes much harder when your project is a monorepo and needs to be composed of several
smaller packages. It multiplies the complexities of each of these points and requires using a
variety of tools to glue together your codebase.

Thankfully, the basic package management within a monorepo is a problem that has largely been solved
by tools like yarn workspaces and lerna. Despite this, there's still all those other items that each
developer embarking on a large project must solve.

## The solution

What we need is a toolkit that provides all of these building blocks out of the box. This is where
`monots` steps into the picture. It provides you with a project template for your ambitious
Typescript monorepo.

Throughout the rest of this readme documentation each point will be outlined with an explanation on
how monots has positioned itself to provide an out of the box solution.

## Usage

### Installation

To get started you will need to install the command line interface.

```bash
# With Yarn
yarn global add @monots/cli

# With NPM
npm install --global @monots/cli
```

Once installed you will have access to the cli command `monots` or if you prefer it's shorter alias
`mts`. For the remainder of the tutorial the shorter version `mts` will be used.

### Commands

To create a new yarn workspace powered by `monots` from scratch run the following command.

```bash
mts create <NAME>
```

This will create a monorepo under the provided folder name.

Th

| Option           | Type     | Default     | Description                                                                                                                                                                                                                                                                           |
| ---------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| --packages       | String[] | `''`        | A comma separated list of packages that will be automatically created with the command. Each package will default to the provided options. e.g. `mts create --package @awesome/cli,@awesome/core,awesome-package` creates 3 packages with the corresponding names.                    |
| --scoped-folders | boolean  | `true`      | When true the scoped packages will be placed in a folder with the same name as the scope. For example if you provide a package called `@awesome/cli` the package would be placed within a folder at the top level called `@awesome/` and the folder would be added to the workspaces. |
| --template       | String   | `'default'` | The template to use. Current options are `'default' | 'ui' | ''`                                                                                                                                                                                                                      |

**API docs**: Using `@microsft/api-extractor` monots is able to automatically build documentation
for all your packages conforming to the `tsdoc` standard. This means that markdown files for your
documentation can be consumed

### Docs

For documentation...

### Alternatives

- [nx](https://github.com/nrwl/nx)
