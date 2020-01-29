# Notes

> Some notes for upgrading to yarn version 2 and it's difficulties.

## Installation

For now it only seems possible to install the cli on a project by project basis.

```bash
yarn init -y
yarn policies set-version berry

# Optional but recommended for latest updates (while in RC)
yarn set version from sources
```

To add all support plugins the following should be done.

```bash
yarn plugin import @yarnpkg/plugin-exec
yarn plugin import @yarnpkg/plugin-interactive-tools
yarn plugin import @yarnpkg/plugin-stage
yarn plugin import @yarnpkg/plugin-typescript
yarn plugin import @yarnpkg/plugin-workspace-tools
```

Since these are officially supported they can be added from npm. Others would need to be added by a
direct url to their source code.

## Tips

- Commit the `.yarn` folder. It wasn't obvious at first.

## Editor Setup

At the moment the best editor to use is the vscode editor and even then there is a lot that needs to
happen in order to get things to work.

The first things is to install the `yarnpkg/pnpify`

```bash
yarn add -D yarnpgk/pnpify
```

And then this needs to be run.

```bash
yarn pnpify --sdk
```

This sets up the resolutions for typescript, prettier and eslint.

At the time of writing the prettier implementation hasn't yet been published so to use it where the
workspace is located at `<DESTINATION>`

```bash
git clone https://github.com/yarnpkg/berry yarn
cd yarn/package/yarnpkg-pnpify

yarn pack
cp package.tgz <DESTINATION>/@yarnpgk-pnpify.tgz
```

Now in your root workspace update your dependencies with the following

```json
{
  "dependencies": {
    "@yarnpkg/pnpify": "file:./@yarnpkg-pnpify.tgz"
  }
}
```

Then reinstall

```bash
yarn install
```

### Typescript

When working with definition files things currently fall apart. I tried adding the vscode-zipfs
solution after building from the repo as outlined above and I ran into issues. It doesn't work and
the same error comes up when trying to access a 3rd party definition file (or implementation) file.

This seems to be the main [limitation](https://github.com/yarnpkg/berry/issues/229).

For now I can just unplug any package where I want to explore the types.

```bash
yarn unplug <DEPENDENCY_TO_EXPLORE>
```

### Bugs

The following are the reasons to come back to yarn v2 at a later date

- VSCode slows down to a crawl any time I open up
- I can't inspect TS code which is a key part of what I want to do.
