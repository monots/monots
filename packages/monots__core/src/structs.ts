import * as t from 'superstruct';

import { keys } from './helpers/index.js';
import type { JsonArray, JsonObject, TsConfigJson } from './types.js';

const custom = {
  false: () => t.define<false>('false', (value): value is false => value === false),
  tsconfig: (): t.Describe<TsConfigJson> =>
    t.record(
      t.string(),
      t.lazy(() => t.optional(JsonValueStruct)),
    ) as any,
};

const JsonArrayStruct: t.Describe<JsonArray> = t.array(t.lazy(() => JsonValueStruct));
const JsonObjectStruct: t.Describe<JsonObject> = t.record(
  t.string(),
  t.lazy(() => t.optional(JsonValueStruct)),
);
const JsonPrimitiveStruct = t.optional(t.nullable(t.union([t.string(), t.number(), t.boolean()])));

/**
 * Represents a valid JsonValue.
 */
export const JsonValueStruct = t.nullable(
  t.union([JsonPrimitiveStruct, JsonArrayStruct, JsonObjectStruct, t.string(), t.number()]),
);

const TsConfigsStruct = t.union([
  custom.false(),
  t.record(t.string(), t.union([custom.tsconfig(), custom.false()])),
]);

/**
 * The configuration object for the monots project. This is placed within the
 * root `package.json` file under the
 */
export const ProjectMonotsConfigStruct = t.type({
  /**
   * The array of glob patterns for the packages to search through in the
   * current monorepo.
   */
  packages: t.array(t.string()),

  /**
   * The base tsconfig that all tsconfigs will extend.
   *
   * @default `@monots/tsconfig/tsconfig.json`
   */
  baseTsconfig: t.optional(t.string()),

  /**
   * Default packages tsconfig settings.
   *
   * Set to false to not disable the automated creation of tsconfig files.
   */
  packageTsConfigs: t.optional(TsConfigsStruct),

  /**
   * The root path to the tsconfig.
   *
   * @default `./tsconfig.json`
   */
  tsconfigPath: t.optional(t.string()),

  /**
   * The structure for the root tsconfig.
   *
   * This is useful for adding settings to the `ts-node` property.
   */
  tsconfig: t.optional(custom.tsconfig()),
});

export type ProjectMonots = t.Infer<typeof ProjectMonotsConfigStruct>;

export const PackageMonotsStruct = t.type({
  /**
   * The entry points from the `src` directory.
   */
  entrypoints: t.optional(t.array(t.string())),

  /**
   * Custom tsconfig settings for the package.
   */
  tsconfigs: t.optional(TsConfigsStruct),

  /**
   * The mode of the `package.json`
   *
   * @default `library`
   */
  mode: t.optional(t.enums(['library', 'app'] as const)),

  /**
   * A list of external modules which should not be bundled.
   *
   * By default all the `dependencies`, `peerDependencies` and
   * `optionalDependencies` are bundled.
   */
  externalModules: t.optional(t.array(t.string())),

  /**
   * Don't use default in the commonjs transformation.
   * @default false
   */
  noDefaultInCommonJs: t.optional(t.boolean()),
});

export type PackageMonots = t.Infer<typeof PackageMonotsStruct>;

export const BaseEntrypointStruct = t.type({
  /**
   * The path to the TypeScript types within the package.
   */
  types: t.optional(t.string()),

  /**
   * The main field to use for commonjs packages.
   */
  main: t.optional(t.string()),

  /**
   * The module field to use for backward compatibility. We always prefer to
   * use `exports`.
   */
  module: t.optional(t.string()),

  /**
   * The browser fields to use, for backwards compatibility.
   */
  browser: t.optional(
    t.union([t.string(), t.record(t.string(), t.union([t.string(), t.boolean()]))]),
  ),
});

export type BaseEntrypoint = t.Infer<typeof BaseEntrypointStruct>;

export const EntrypointDataStruct = t.intersection([JsonObjectStruct, BaseEntrypointStruct]);

export type EntrypointData = t.Infer<typeof EntrypointDataStruct>;

export const BaseDataStruct = t.intersection([
  JsonObjectStruct,
  t.type({ monots: t.optional(JsonObjectStruct) }),
]);

export type BaseData = t.Infer<typeof BaseDataStruct>;

const ModuleStruct = t.enums(['module' as const, 'commonjs' as const]);
const PackageJsonWorkspacesStruct = t.union([
  t.array(t.string()),
  t.object({
    packages: t.optional(t.array(t.string())),
    nohoist: t.optional(t.array(t.string())),
  }),
]);

export const ProjectDataStruct = t.intersection([
  JsonObjectStruct,
  t.type({
    name: t.optional(t.string()),
    workspaces: t.optional(PackageJsonWorkspacesStruct),
    monots: t.optional(ProjectMonotsConfigStruct),
    browserslist: t.optional(t.any()),
    type: t.optional(ModuleStruct),
    scripts: t.optional(t.record(t.string(), t.string())),
    dependencies: t.optional(t.record(t.string(), t.string())),
  }),
]);

export type ProjectData = t.Infer<typeof ProjectDataStruct>;

/**
 * A struct to validate the fields entered into the package level package.json.
 */
export const PackageDataStruct = t.intersection([
  JsonObjectStruct,
  BaseEntrypointStruct,
  t.type({
    /**
     * The name of the package.
     */
    name: t.string(),

    /**
     * The type of the module.
     *
     * @default `module`
     */
    type: t.optional(ModuleStruct),

    /**
     * The files that are included within the distribution.
     *
     * Defaults to including `dist` and `dist-types`.
     */
    files: t.optional(t.array(t.string())),

    /**
     * The exports from this package.
     */
    exports: t.optional(
      t.record(t.string(), t.union([t.record(t.string(), t.string()), t.string()])),
    ),
    dependencies: t.optional(t.record(t.string(), t.string())),
    devDependencies: t.optional(t.record(t.string(), t.string())),
    peerDependencies: t.optional(t.record(t.string(), t.string())),
    optionalDependencies: t.optional(t.record(t.string(), t.string())),
    browserslist: t.optional(t.any()),

    /**
     * The monots configuration object for packages.
     */
    monots: t.optional(PackageMonotsStruct),
  }),
]);

export type PackageData = t.Infer<typeof PackageDataStruct>;
export const exportFields = ['import', 'require', 'browser', 'types', 'default'] as const;
export const entrypointFields = keys(BaseEntrypointStruct.schema);
export type ExportsField = typeof exportFields[number];
export type EntrypointField = keyof BaseEntrypoint;
