import { cosmiconfig, cosmiconfigSync } from 'cosmiconfig';
import Mustache from 'mustache';
import { dirname, join, relative } from 'path';
import readPkg from 'read-pkg';

import { PACKAGE_NAME } from './constants';
import { deepMerge } from './helpers';
import { ConfigTemplateProperties, MonotsConfig, MonotsPackage, PackageJson } from './types';

Mustache.escape = (value) => value;

const defaultConfig: Required<MonotsConfig> = {
  babelConfig: {},
  tsconfigBasePaths: {},
  supportDirectory: 'support',
  outputDirectory: 'dist',
  tsconfigBasePath: '{{supportDirectory}}/tsconfig.base.json',
  tsconfigBaseExtends: '@monots/tsconfig',
  tsconfigBase: {},
  tsconfigBuildName: 'tsconfig.build.json',
  tsconfigBuild: {
    compilerOptions: {
      outDir: '{{outputDirectory}}',
      rootDir: 'src',
      composite: true,
      declaration: true,
      declarationMap: true,
      baseUrl: 'src',
      paths: {},
    },
    exclude: [
      '{{outputDirectory}}',
      '**/*.test.{ts,tsx}',
      '**/*.stories.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      '**/__mocks__/**',
      '**/__tests__/**',
      '**/__stories__/**',
    ],
  },
};

/**
 * Make desired paths in the config absolute paths.
 */
const resolveConfigPaths = (config: MonotsConfigResult): MonotsConfigResult => {
  const templateValues: ConfigTemplateProperties = {
    rootDirectory: config.rootDirectory,
    supportDirectory: config.absolutePathFromRelative(config.supportDirectory),
    tsconfigBasePath: config.absolutePathFromRelative(
      config.supportDirectory,
      config.tsconfigBasePath,
    ),
  };

  return {
    ...config,
    tsconfigBasePath: Mustache.render(config.tsconfigBasePath, templateValues),
  };
};

interface GetConfigOptions {
  /**
   * Whether to reuse the same config value within the currently running process.
   *
   * @defaultValue false
   */
  disableCache?: boolean;

  /**
   * The directory from which to start searching for a configuration.
   *
   * @defaultValue `process.cwd()`
   */
  cwd?: string;
}

interface MonotsConfigResult extends Required<MonotsConfig> {
  /**
   * The path to the file where the configuration was found.
   */
  configFilePath: string;

  /**
   * The root directory where the configuration was found.
   */
  rootDirectory: string;

  /**
   * Get the absolute path from the root directory to the provided path (relative to the root).
   */
  absolutePathFromRelative(...paths: string[]): string;

  /**
   * The relative path from the root directory to the provided package.
   */
  relativePathFromRootToPackage(pkg: MonotsPackage, ...paths: string[]): string;

  packageJson: PackageJson;
}

let monotsConfig: MonotsConfigResult;

/**
 * Retrieve the closest configuration for the current process (or provided
 * `startDirectory` option).
 */
export async function getConfig({
  disableCache = false,
  cwd = process.cwd(),
}: GetConfigOptions = {}): Promise<MonotsConfigResult> {
  if (monotsConfig && !disableCache) {
    return monotsConfig;
  }

  const explorer = cosmiconfig(PACKAGE_NAME);
  const found = await explorer.search(cwd);

  if (!found) {
    throw new Error('No monots config  found');
  }

  const configFilePath = found.filepath;
  const rootDirectory = dirname(found.filepath);
  const packageJson = await readPkg({ cwd: rootDirectory });
  const mergedConfig = deepMerge<Required<MonotsConfig>>(defaultConfig, found.config ?? {});
  const config: MonotsConfigResult = resolveConfigPaths({
    ...mergedConfig,
    packageJson,
    rootDirectory,
    configFilePath,
    absolutePathFromRelative: (...paths) => join(rootDirectory, ...paths),
    relativePathFromRootToPackage: (pkg, ...paths) =>
      relative(rootDirectory, join(pkg.dir, ...paths)),
  });

  monotsConfig = config;
  return monotsConfig;
}

export function getConfigSync({
  disableCache = false,
  cwd = process.cwd(),
}: GetConfigOptions = {}) {
  if (monotsConfig && !disableCache) {
    return monotsConfig;
  }

  const explorer = cosmiconfigSync(PACKAGE_NAME);
  const found = explorer.search(cwd);

  if (!found) {
    throw new Error('No monots config found');
  }

  const configFilePath = found.filepath;
  const rootDirectory = dirname(found.filepath);
  const packageJson = readPkg.sync({ cwd: rootDirectory });
  const mergedConfig = deepMerge<Required<MonotsConfig>>(defaultConfig, found.config ?? {});
  const config: MonotsConfigResult = resolveConfigPaths({
    ...mergedConfig,
    packageJson,
    rootDirectory,
    configFilePath,
    absolutePathFromRelative: (...paths) => join(rootDirectory, ...paths),
    relativePathFromRootToPackage: (pkg, ...paths) =>
      relative(rootDirectory, join(pkg.dir, ...paths)),
  });

  monotsConfig = config;
  return monotsConfig;
}
