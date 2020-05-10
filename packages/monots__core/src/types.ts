import { TransformOptions } from '@babel/core';
import { PackageJson as BasePackageJson, TsConfigJson } from 'type-fest';
import { MapLike } from 'typescript';

/**
 * The configuration object for a sub package within the monots project.
 */
export interface MonotsPackageConfig {
  /**
   * Determines whether the package has a custom tsconfig file.
   *
   * @remarks
   *
   * - When false, no custom tsconfig file is present.
   * - When 'custom' there is a tsconfig file, but it is controlled by the user.
   * - When `object` the provided properties will be used to create a tsconfig
   * file in the package directory.
   *
   * @defaultValue false
   */
  tsconfig?: false | TsConfigJson | 'custom';

  /**
   * The monots package type.
   *
   * @defaultValue `libary`
   */
  type?: PackageType;
}

/**
 * The type of package that this is. This determines how it will be built.
 *
 * @remarks
 *
 * Libraries, cli's and servers e2e types are automatically built.
 *
 * @alpha
 */
export enum PackageType {
  /**
   * This is an app that doesn't need to produce it's own types.
   *
   * It will typically have it's own build step.
   */
  App = 'app',

  /**
   * This is a library.
   */
  Library = 'library',

  /**
   * An e2e package.
   */
  E2E = 'e2e',
  Server = 'server',
  CLI = 'cli',
  Other = 'other',
}

/**
 * The PackageJson interface with monots specific configuration.
 */
export interface PackageJson extends BasePackageJson {
  /**
   * The package level configuration which allows overriding certain properties
   * on a per package basis.
   */
  monotsPackage?: MonotsPackageConfig;

  /**
   * The configuration object for the monots codebase.
   *
   * @remarks
   *
   * This should only exist at the base of the project.
   *
   * @defaultValue `undefined`
   */
  monots?: MonotsConfig;

  /**
   * Used to configure yarn (and other) workspaces.
   *
   * Please note private should be set to true to use workspaces
   */
  workspaces?:
    | string[]
    | {
        /**
         * The packages blob to use for workspaces.
         */
        packages?: string[];
        /**
         * A list of glob patterns for npm packages that should not be hoisted.
         */
        nohoist?: string[];
      };
}

export interface MonotsPackage {
  /**
   * The packageJSON file configuration for this package.
   */
  packageJson: PackageJson;

  /**
   * The package name.
   */
  name: string;

  /**
   * The absolute location of the directory containing the packages files.
   */
  dir: string;

  /**
   * The package level monots configuration which allows overriding certain
   * properties on a per package basis.
   */
  monotsConfig: Required<MonotsPackageConfig>;
}

export interface MonotsConfig {
  /**
   * Where the package build directory should be relative to it's `package.json` file.
   *
   * @default 'dist'
   */
  outputDirectory: string;
  /**
   * The default path to the support directory.
   *
   * @remarks
   *
   * This helps remove clutter from the root folder by placing some of the
   * auto-generated files within this support directory.
   *
   * @defaultValue 'support'
   */
  supportDirectory?: string;

  /**
   * The default path name of the tsconfig base file which your own `tsconfig`
   * should extend from.
   *
   * @remarks
   *
   * This configuration will automatically be injected with the file paths.
   *
   * @defaultValue '{{supportDirectory}}/tsconfig.base.json'
   */
  tsconfigBasePath?: string;

  /**
   * Additional `compilerOptions.paths` to add to the `tsconfig.base.json` file.
   *
   * @remarks
   *
   * Paths are automatically generated from all the project libraries and this
   * option allows for extra paths to be added.
   *
   * Each path should be relative to the rootDirectory.
   *
   * @defaultValue `{}`
   */
  tsconfigBasePaths?: MapLike<string[]>;

  /**
   * Set the `extends` property for the `tsconfig.base.json` file.
   *
   * @defaultValue '@monots/tsconfig'
   */
  tsconfigBaseExtends?: string;

  /**
   * Allows for overriding any part of the base tsconfig configuration.
   */
  tsconfigBase?: TsConfigJson;

  /**
   * The file name of the main tsconfig build file and also the local package
   * instances.
   *
   * @defaultValue 'tsconfig.build.json'
   */
  tsconfigBuildName?: string;

  /**
   * The default configuration to use for each individual packages build
   * tsconfig json file.
   *
   * @remarks
   *
   * The default files to exclude from the individual package build tsconfig
   * json files can be overriden here.
   *
   * Their default is `['lib', '**\/*.test.{ts,tsx}', '**\/*.stories.{ts,tsx}',
   *   '**\/*.spec.{ts,tsx}', '**\/__mocks__/**', '**\/__tests__/**',
   *   '**\/__stories__/**',
   * ]`
   */
  tsconfigBuild?: TsConfigJson;

  /**
   * Extra options to pass to the babel configuration. Here you can set up
   * additional transforms that should be applied to all packages.
   *
   * @defaultValue `{}`
   */
  babelConfig?: TransformOptions;
}

/**
 * The properties available within the config configuration when setting the
 * paths of different values.
 *
 * @remarks
 *
 * Each property can be placed within a mustache template and the value will be
 * used at runtime.
 *
 * Each value is a full and absolute path.
 */
export interface ConfigTemplateProperties {
  /**
   * The relative path to the support directory.
   */
  supportDirectory: string;

  /**
   * The full path to the root directory for the monots project.
   */
  rootDirectory: string;

  /**
   * The relative path from the root to the tsconfig that should be used as the
   * base config for the entire project.
   */
  tsconfigBasePath: string;
}

/**
 * The template interface
 */
export interface Template<Context extends TemplateContext = TemplateContext> extends BaseTemplate {
  /**
   * The package creator.
   */
  createPackageJson(context: Context): PackageJson;

  /**
   * Additional context variables to use when processing the files.
   */
  extraContext(context: Context): Context;
}

/**
 * The base template interface without any context.
 */
export interface BaseTemplate {
  /**
   * The name of this template
   */
  name: string;

  /**
   * The development dependencies which will be installed.
   */
  devDependencies: string[];

  /**
   * A list of files which require template transformation. This happens before file renaming.
   */
  templateFiles: string[];

  /**
   * Files to rename after copying from the template directory. This is mainly for dot files which
   * won't be picked up when copied as dot files.
   *
   * TODO copy files over to multiple locations with an array.
   */
  renameFiles: MapLike<string | string[]>;

  /**
   * The absolute path to the template.
   */
  path: string;
}

type TemplateContext = Record<string, unknown>;

export interface MonorepoTemplateContext extends TemplateContext {
  name: string;

  /**
   * @defaultValue 'MIT'
   */
  license: string;
}

export interface PackageTemplate extends Template {
  dependencies: string[];
  type: PackageType;
}

export interface MonorepoTemplate extends Template<MonorepoTemplateContext> {}

/**
 * Returns the type that is wrapped inside a `Promise` type.
 *
 * ```ts
 * import { asyncFunction } from 'api';
 * import { UnwrapPromise } from 'type-fest';
 *
 * let data: UnwrapPromise<ReturnType<typeof asyncFunction>>;
 *
 * async function setValue () {
 *   data = await asyncFunction();
 * }
 *
 * setValue();
 * ```
 */
export type UnwrapPromise<MaybePromise> = MaybePromise extends PromiseLike<infer Type>
  ? Type
  : MaybePromise;
