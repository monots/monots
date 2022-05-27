import path from 'node:path';
import * as s from 'superstruct-extra';

import { OUTPUT_FOLDER } from './constants.js';

const Tsconfig = s.record(s.string(), s.any());
const Tsconfigs = s.union([
  s.literal(false),
  s.record(s.string(), s.union([Tsconfig, s.literal(false)])),
]);

/**
 * The supported build tools.
 */
const BuildToolEnum = s.enums(['rollup-swc', 'rollup-esbuild', 'swc', 'esbuild']);

/**
 * A valid yarn workspace configuration.
 */
const Workspaces = s.union([
  s.array(s.string()),
  s.object({
    packages: s.optional(s.array(s.string())),
    nohoist: s.optional(s.array(s.string())),
  }),
]);

export type Entrypoint = s.Infer<typeof Entrypoint>;
/**
 * The entrypoint object values.
 */
export const Entrypoint = s.type({
  /**
   * The path to the TypeScript types within the package.
   */
  types: s.optional(s.string()),

  /**
   * The main field to use for commonjs packages.
   */
  main: s.optional(s.string()),

  /**
   * The module field to use for backward compatibility. We always prefer to use
   * `exports`.
   */
  module: s.optional(s.string()),

  /**
   * The browser fields to use, for backwards compatibility.
   */
  browser: s.optional(
    s.union([s.string(), s.record(s.string(), s.union([s.string(), s.boolean()]))]),
  ),

  /**
   * The exports from this package.
   */
  exports: s.optional(
    s.record(s.string(), s.union([s.record(s.string(), s.string()), s.string()])),
  ),
});

/**
 * The support modules in a package.json file
 */
const ModuleEnum = s.enums(['module', 'commonjs']);

export type PackageMonots = s.Infer<typeof PackageMonots>;
export const PackageMonots = s.type({
  /**
   * The entry points from the `src` directory.
   */
  entrypoints: s.defaulted(s.optional(s.array(s.string())), ['index.{ts,tsx}']),

  /**
   * Custom tsconfig settings for the package.
   */
  tsconfigs: s.defaulted(s.optional(Tsconfigs), {}),

  /**
   * The mode of the `package.json`
   *
   * @default `library`
   */
  mode: s.defaulted(s.optional(s.enums(['library', 'app', 'cli'] as const)), 'library'),

  /**
   * A list of external modules which should not be bundled.
   *
   * By default all the `dependencies`, `peerDependencies` and
   * `optionalDependencies` are bundled.
   */
  externalModules: s.defaulted(s.optional(s.array(s.string())), []),

  /**
   * The name of the source folder. Set to an empty string to use the root of
   * the package as the source folder.
   *
   * This can be useful if exporting only TypeScript files from a package.
   *
   * @default `./src`
   */
  sourceFolderName: s.optional(s.string()),

  /**
   * Additional exports to make from this package.
   */
  extraExports: s.optional(
    s.record(s.string(), s.union([s.record(s.string(), s.string()), s.string()])),
  ),

  /**
   * Set to true to completely bypass managing the exports field of this
   * package.
   *
   * This can be useful when you need to turn off the exports field.
   */
  ignoreExports: s.optional(s.boolean()),

  /**
   * Whether to add an exports field to the entrypoint.
   *
   * This is useful internally when running tests. I'm adding it to make testing
   * easier in the https://github.com/skribbledev/skribble monorepo. It might
   * also help with certain build tools.
   *
   * @default false
   */
  addExportsToEntrypoints: s.optional(s.boolean()),
});

export type Package = s.Infer<typeof Package>;
/**
 * A struct to validate the fields entered into the package level package.json.
 */
export const Package = s.assign(
  Entrypoint,
  s.type({
    /**
     * The name of the package.
     */
    name: s.string(),

    /**
     * The type of the module.
     *
     * @default `module`
     */
    type: s.optional(ModuleEnum),

    /**
     * The files that are included within the distribution.
     *
     * Defaults to including `dist` and `dist-types`.
     */
    files: s.optional(s.array(s.string())),

    /**
     * The exports from this package.
     */
    exports: s.optional(
      s.record(s.string(), s.union([s.record(s.string(), s.string()), s.string()])),
    ),
    dependencies: s.optional(s.record(s.string(), s.string())),
    devDependencies: s.optional(s.record(s.string(), s.string())),
    peerDependencies: s.optional(s.record(s.string(), s.string())),
    optionalDependencies: s.optional(s.record(s.string(), s.string())),
    browserslist: s.optional(s.any()),

    /**
     * The monots configuration object for packages.
     */
    monots: s.optional(PackageMonots),
  }),
);

export type ProjectMonots = s.Infer<typeof ProjectMonots>;
/**
 * The configuration object for the monots project. This is placed within the
 * root `package.json` file under the
 */
export const ProjectMonots = s.type({
  /**
   * The array of glob patterns for the packages to search through in the
   * current monorepo.
   *
   * @default []
   */
  packages: s.defaulted(s.array(s.string()), []),

  /**
   * The build tool that should be used
   *
   * @default 'rollup-swc'
   */
  tool: s.defaulted(s.optional(BuildToolEnum), 'rollup-swc'),

  /**
   * The base tsconfig that all tsconfigs will extend.
   *
   * This also supports relative paths to a local file. In order for a path to
   * be considered as relative, it must start with `./` or `../`.
   *
   * @default `@monots/tsconfig/tsconfig.json`
   */
  baseTsconfig: s.defaulted(s.optional(s.string()), '@monots/tsconfig/tsconfig.json'),

  /**
   * Default packages tsconfig settings.
   *
   * Set to false to not disable the automated creation of tsconfig files.
   */
  packageTsconfigs: s.defaulted(s.optional(Tsconfigs), {
    '': false,
    src: { compilerOptions: { types: [], noEmit: true, outDir: path.join('..', OUTPUT_FOLDER) } },
  }),

  /**
   * The root path to the tsconfig.
   *
   * @default `./tsconfig.json`
   */
  tsconfigPath: s.defaulted(s.optional(s.string()), './tsconfig.json'),

  /**
   * The packages folder.
   *
   * @default `./packages`
   */
  packagesFolder: s.defaulted(s.optional(s.string()), './packages'),

  /**
   * The structure for the root tsconfig.
   */
  tsconfig: s.defaulted(s.optional(Tsconfig), {}),
});

export type Project = s.Infer<typeof Project>;
export const Project = s.type({
  /**
   * The name of the package.json file.
   */
  name: s.optional(s.string()),

  /**
   * The workspaces to use.
   */
  workspaces: s.optional(Workspaces),

  /**
   * The monots configuration.
   */
  monots: s.optional(ProjectMonots),

  /**
   * The browserslist configuration.
   */
  browserslist: s.optional(s.any()),

  /**
   * The project type.
   *
   * @default 'module'
   */
  type: s.optional(ModuleEnum),

  /**
   * The scripts.
   *
   * @default {}
   */
  scripts: s.optional(s.record(s.string(), s.string())),

  /**
   * The dependencies at the root.
   */
  dependencies: s.optional(s.record(s.string(), s.string())),
});

export const exportFields = ['import', 'require', 'browser', 'types', 'default'] as const;
export const entrypointFields = ['types', 'main', 'module', 'browser'] as const;

export type ExportsField = typeof exportFields[number];
export type EntrypointField = typeof entrypointFields[number];
