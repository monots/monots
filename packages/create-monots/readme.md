# create-monots

> The easiest way to get started with **monots**.

The easiest way to get started with **monots** is by using `create-monots`. This CLI tool enables you to quickly start building a new **monots** project, with everything set up for you. You can create a new project using the default template, or by using one of the [official boilerplate](https://github.com/monots/examples). To get started, use the following command:

```bash
npx create-monots
```

To create a new project with a specific name, you can send a name as an argument. For example, the following command will create a new project `awesome` in a folder with the same name:

```bash
npx create-monots awesome
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

## Options

`create-monots` comes with the following options:

- **-e, --example [name]|[github-url]** - An example to bootstrap the app with. You can use an example name from the [monots examples repo](https://github.com/monots/examples) or a GitHub URL. The URL can use any branch and/or subdirectory.
- **--example-path &lt;path-to-example&gt;** - In a rare case, your GitHub URL might contain a branch name with a slash (e.g. bug/fix-1) and the path to the example (e.g. foo/bar). In this case, you must specify the path to the example separately: `--example-path foo/bar`

## Why use `create-monots`?

`create-monots` allows you to create a new project within seconds. Additionally it comes with the following features.

- **Interactive Experience**: Running `npx create-monots` (with no arguments) launches an interactive experience that guides you through setting up a project.
- **Zero Dependencies**: Initializing a project is as quick as one second. `create-monots` has zero dependencies.
- **Offline Support**: `create-monots` will automatically detect if you're offline and bootstrap your project using your local package cache.
- **Support for Examples**: `create-monots` can bootstrap your application using an example from the **monots** examples collection (e.g. `npx create-monots --example api-routes`).
- **Tested**: The package is part of the **monots** monorepo and tested using the same integration test suite as **monots** itself, ensuring it works as expected with every release.
