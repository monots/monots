import type { Merge, MergeExclusive, Negative, ValueOf } from 'type-fest';

export interface MonotsConfig {
  /**
   * The plugins for the root packages.
   */
  plugins?: MonotsPlugin[];

  /**
   * The array of glob patterns for the packages to search through in the
   * current monorepo.
   *
   * If left blank, all packages will be in the workspace will be used.
   *
   * @default `pnpm-workspace.yaml` or `package.json > workspaces`
   */
  packages?: string[];

  tsconfig?: {
    /**
     * The base tsconfig that all generated tsconfig files will extend from.
     *
     * This also supports relative paths to a local file. In order for a path to
     * be considered as relative, it must start with `./` or `../`.
     *
     * @default `@monots/tsconfig/tsconfig.json`
     */
    base?: string;
    /**
     * The root tsconfig file.
     *
     * @default `./tsconfig.json`
     */
    path?: string;
  };

  /**
   * The globs which match the package names followed by a configuration.
   *
   * ```ts
   * config = {
   *   '**': {
   *     plugins: [npm({})],
   *   }
   * }
   * ```
   */
  config: Record<string, PackageConfig>;
}

/**
 * Transform a union type into a union of the type and the readonly array of
 * types.
 *
 * ```
 * type Simple = string | number;
 * SimpleAsArray = Array<Simple>; => `string  | number | string[] | number[]`
 * ```
 */
export type AsArray<T> = T extends T ? T | readonly T[] : never;

export interface PackageConfig {
  glob: AsArray<string | RegExp>;
  plugins?: MonotsPlugin[];
  excludedPlugins?: PluginName[];
}

export interface RootConfig {}

/**
 * Each command that can be run and the context to run it with.
 *
 * Plugins can extend this interface to add their own commands to the monots
 * cli.
 */
export interface MonotsCommandContext {
  fix: object;
  build: object;
}

export type MonotsCommandName = keyof MonotsCommandContext;
export type PluginScope = 'root' | 'package' | 'any';

export interface Plugin {
  /**
   * The command that the plugin is active for.
   */
  command: LiteralString;

  /**
   * The scope of the plugin whether it operates on the monots project of
   * package level.
   */
  scope: PluginScope;
}

// export interface PackagePlugin {
//   scope: 'package' | 'any';
// }

interface ExamplePlugin extends Plugin {
  command: 'fix';
  scope: 'package';
  example: string;
}

type LiteralString = string & Record<never, never>;

/**
 * Use this interface to register the plugin interface for a given command.
 *
 * The key should be a unique name and should the same name provided to the
 * plugin configuration.
 *
 * ```
 * import { AvailablePlugin } from '@monots/types';
 *
 * interface MinePlugin {
 *   command: 'mine';
 *   data: { something: number }
 * }
 *
 * declare module '@monots/types' {
 *   export interface AvailablePlugins {
 *     mine: MinePlugin;
 *   }
 * }
 * ```
 */
export interface AvailablePlugins {
  [key: LiteralString]: Plugin;
  example: ExamplePlugin;
}

export type MonotsPlugin = ValueOf<AvailablePlugins>;
export type PackagePlugin = Exclude<MonotsPlugin, { scope: 'root' }>;
export type RootPlugin = Exclude<MonotsPlugin, { scope: 'package' }>;
export type PluginName = keyof AvailablePlugins;
