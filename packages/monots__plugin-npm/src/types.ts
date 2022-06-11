import type { MonotsPriority } from '@monots/constants';
import type { BaseCorePlugin } from '@monots/core';
import type { Matcher } from 'anymatch';

/**
 * Props provided to the `await NpmPackage.create(props)` method.
 */
export interface NpmPackageProps extends monots.NpmPackageProps {}

export interface NpmPackageConfig extends NpmPackageProps {
  /**
   * The packages that this configuration should be applied to.
   *
   * `**` will apply to all packages.
   */
  matches?: Matcher;
}

export interface NpmEntrypointProps extends monots.NpmEntrypointProps {}
export interface NpmPluginProps extends monots.NpmPluginProps {
  /**
   * The packages that can be managed by this npm plugin.
   *
   * If this is not specified then all workspaces will be loaded from the
   * package manager workspace default.
   *
   * Matches can be negated by prefixing the package name with `!`.
   *
   * Search by filepath when prefixing the string with a `./`.
   *
   * ```ts
   * import { npmPlugin } from '@monots/plugin-npm';
   *
   * npmPlugin({
   *   matches: [
   *     './packages/*', // all subdirectories of the package folder
   *     'apps-*', // names starting with the 'apps-' prefix
   *     '!apps-foo', // exclude the apps-foo package
   *     (path) => path === '@scope/name', // match by filepath or package name
   *     '@scope/name', // matches the exact package name
   *   ],
   * })
   * ```
   *
   * @default `pnpm-workspace.yaml` or `package.json > workspaces`
   */
  matches?: Matcher;

  /**
   * Configure the packages.
   */
  packages?: NpmPackageConfig[];
}

/**
 * Workspace plugins operate on the entire workspace.
 */
export interface NpmWorkspacePlugin {
  /**
   * The name of the plugin.
   */
  name: string;
  priority?: MonotsPriority;
}

export interface NpmPlugin extends BaseCorePlugin {
  type: 'npm';
}

declare global {
  namespace monots {
    interface Plugins {
      npm: NpmPlugin;
    }

    interface NpmPluginProps {}
    interface NpmPackageProps {}
    interface NpmEntrypointProps {}
  }
}
