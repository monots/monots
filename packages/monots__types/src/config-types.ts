import type { MonotsPriority } from '@monots/constants';
import type { RemoveIndexSignature, ValueOf } from 'type-fest';

/**
 * The container for all events that can be emitted by the monots package.
 */
export interface MonotsEvents extends monots.Events {}

// export type Events = RemoveIndexSignature<MonotsEvents>;

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
  // config: Record<string, PackageConfig>;
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

// export interface PackageConfig {
//   glob: AsArray<string | RegExp>;
//   plugins?: MonotsPlugin[];
//   excludedPlugins?: PluginName[];
// }

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

/**
 * This is defined as a type so that it can't be extended with declaration
 * merging.
 */
export interface BasePluginProps {
  /**
   * The configuration object as loaded from the configuration file.
   */
  config: MonotsConfig;

  /**
   * The path to the configuration file.
   */
  path: string;

  /**
   * The root directory of the monots project.
   */
  root: string;

  /**
   * The dependencies that were loaded from the configuration file.
   */
  dependencies: string[];

  /**
   * Get the posix path relative to the monorepo root directory.
   */
  getPath: (...paths: string[]) => string;
}

/**
 * The resolved configuration which can be updated by returning an object with
 * properties in the `load` event handler.
 */
export interface ResolvedMonotsConfig extends BasePluginProps, monots.ResolvedConfig {
  /**
   * All the resolved plugins.
   */
  plugins: ResolvedPlugin[];
}

export interface PluginProps extends BasePluginProps {}

type PluginTransformer<Instance extends Plugin> = (plugin: Instance) => PluginFunction;

export interface Plugin {
  /**
   * The name of the plugin which is used for debugging.
   */
  name: string;

  /**
   * The type of plugin.
   */
  type: string;

  /**
   * Set the priority of the plugin. A higher number is a higher priority and
   * will be loaded earlier.
   *
   * @default MonotsPriority.Default
   */
  priority?: MonotsPriority | number;

  /**
   * This can be used to register new plugin formats. Resolved plugins can do
   * anything but aren't easy to work with. This allows you to register your own
   * plugin formats which can be used to make certain workflows easier.
   */
  transformers?: Partial<PluginTransformers>;
}

export type PluginTransformers = { [Key in keyof Plugins]: PluginTransformer<Plugins[Key]> };

/**
 * This is the runtime type for all plugins. Transformers can be registered to
 * make plugins easier to work with, but at their core a plugin is just a
 * `plugin` method that takes an emitter and produces side effects.
 */
export interface ResolvedPlugin extends Plugin {
  type: 'resolved';

  /**
   * The original plugin instance. This is undefined if the plugin was initially
   * a `ResolvedPlugin`.
   */
  original?: MonotsPlugin;

  /**
   * The function called to run the plugin.
   */
  plugin: PluginFunction;
}

export type PluginFunction = (props: PluginProps) => MaybePromise<void>;

/**
 * Use this interface to register the plugin expected instance for a plugin
 * type.
 *
 * The type should be a unique name and should match the type key property of
 * the plugin.
 *
 * The following example is how to register a plugin with types.
 *
 * ```
 * interface MinePlugin {
 *   // required field
 *   name: string;
 *   // required field
 *   type: 'mine';
 *   // A custom field
 *   handleSomething(name: string): Promise<void>
 * }
 *
 * // Now register the type in available plugins.
 * declare global {
 *   namespace monots {
 *     interface MonotsPlugins {
 *       mine: MinePlugin;
 *     }
 *   }
 * }
 * ```
 */
export interface MonotsPlugins extends monots.Plugins {
  /**
   * This is the plugin that is understood by the `monots` plugin engine.
   */
  resolved: ResolvedPlugin;
  example: ExamplePlugin;
  other: OtherPlugin;
}

interface ExamplePlugin extends Plugin {
  type: 'example';
  onSomething: () => void;
}

interface OtherPlugin extends Plugin {
  type: 'other';
  init: () => void;
}

export type Plugins = RemoveIndexSignature<MonotsPlugins>;
export type PluginTypes = keyof Plugins;
/**
 * The union of all plugin types.
 */
export type MonotsPlugin = ValueOf<Plugins>;
export type MaybePromise<Type> = Promise<Type> | Type;

declare global {
  namespace monots {
    /**
     * Extend this interface to add your own typed events to emit.
     */
    interface Events {
      [key: string]: (...args: any[]) => MaybePromise<any>;
    }
    interface Plugins {
      [key: string]: Plugin;
    }
    interface ResolvedConfig {}
  }
}
