import path from 'node:path';
import * as s from 'superstruct-extra';

import { OUTPUT_FOLDER } from './constants.js';
import { keys } from './helpers/index.js';

const tsConfigSchema = s.record(s.string(), s.any());
const tsConfigsSchema = s.union([
  s.literal(false),
  s.record(s.string(), s.union([tsConfigSchema, s.literal(false)])),
]);

/**
 * The supported build tools.
 */
const buildToolEnum = s.enums(['rollup-swc', 'rollup-esbuild', 'swc', 'esbuild']);

/**
 * A valid yarn workspace configuration.
 */
const workspacesSchema = s.union([
  s.array(s.string()),
  s.object({
    packages: s.optional(s.array(s.string())),
    nohoist: s.optional(s.array(s.string())),
  }),
]);

/**
 * The entrypoint object values.
 */
export const entrypointSchema = s.type({
  /**
   * The path to the TypeScript types within the package.
   */
  types: s.optional(s.string()),

  /**
   * The main field to use for commonjs packages.
   */
  main: s.optional(s.string()),

  /**
   * The module field to use for backward compatibility. We always prefer to
   * use `exports`.
   */
  module: s.optional(s.string()),

  /**
   * The browser fields to use, for backwards compatibility.
   */
  browser: s.optional(
    s.union([s.string(), s.record(s.string(), s.union([s.string(), s.boolean()]))]),
  ),
});

/**
 * The support modules in a package.json file
 */
const moduleEnum = s.enums(['module', 'commonjs']);

export const packageMonotsSchema = s.type({
  /**
   * The entry points from the `src` directory.
   */
  entrypoints: s.defaulted(s.optional(s.array(s.string())), ['index.{ts,tsx}']),

  /**
   * Custom tsconfig settings for the package.
   */
  tsconfigs: s.defaulted(s.optional(tsConfigsSchema), {}),

  /**
   * The mode of the `package.json`
   *
   * @default `library`
   */
  mode: s.defaulted(s.optional(s.enums(['library', 'app'] as const)), 'library'),

  /**
   * A list of external modules which should not be bundled.
   *
   * By default all the `dependencies`, `peerDependencies` and
   * `optionalDependencies` are bundled.
   */
  externalModules: s.defaulted(s.optional(s.array(s.string())), []),
});

/**
 * A struct to validate the fields entered into the package level package.json.
 */
export const packageSchema = s.assign(
  entrypointSchema,
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
    type: s.optional(moduleEnum),

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
    monots: s.optional(packageMonotsSchema),
  }),
);

/**
 * The configuration object for the monots project. This is placed within the
 * root `package.json` file under the
 */
export const projectMonotsSchema = s.type({
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
  tool: s.defaulted(s.optional(buildToolEnum), 'rollup-swc'),

  /**
   * The base tsconfig that all tsconfigs will extend.
   *
   * @default `@monots/tsconfig/tsconfig.json`
   */
  baseTsconfig: s.defaulted(s.optional(s.string()), '@monots/tsconfig/tsconfig.json'),

  /**
   * Default packages tsconfig settings.
   *
   * Set to false to not disable the automated creation of tsconfig files.
   */
  packageTsConfigs: s.defaulted(s.optional(tsConfigsSchema), {
    '': false,
    src: {
      compilerOptions: { types: [], noEmit: true, outDir: path.join('..', OUTPUT_FOLDER) },
    },
    __tests__: {
      compilerOptions: { declaration: false, noEmit: true },
      include: ['./'],
    },
    __types__: {
      compilerOptions: {
        declaration: false,
        noEmit: true,
        noUnusedParameters: false,
        noUnusedLocals: false,
      },
      include: ['./'],
    },
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
   *
   * This is useful for adding settings to the `ts-node` property.
   */
  tsconfig: s.defaulted(s.optional(tsConfigSchema), {}),
});

export const projectSchema = s.type({
  /**
   * The name of the package.json file.
   */
  name: s.optional(s.string()),

  /**
   * The workspaces to use.
   */
  workspaces: s.optional(workspacesSchema),

  /**
   * The monots configuration.
   */
  monots: s.optional(projectMonotsSchema),

  /**
   * The browserslist configuration.
   */
  browserslist: s.optional(s.any()),

  /**
   * The project type.
   *
   * @default 'module'
   */
  type: s.optional(moduleEnum),

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
export const entrypointFields = keys(entrypointSchema.schema);

export type ExportsField = typeof exportFields[number];
export type EntrypointField = keyof Entrypoint;
export type Entrypoint = s.Infer<typeof entrypointSchema>;

export type PackageMonots = s.Infer<typeof packageMonotsSchema>;
export type Package = s.Infer<typeof packageSchema>;

export type ProjectMonots = s.Infer<typeof projectMonotsSchema>;
export type Project = s.Infer<typeof projectSchema>;
