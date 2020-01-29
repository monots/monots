import is from '@sindresorhus/is';
import { all as merge } from 'deepmerge';
import execa from 'execa';
import getWorkspaces from 'get-workspaces';
import path from 'path';

import { MonotsPackage, MonotsPackageConfig, PackageJson, PackageType } from './types';

const separator = '__';

export const unmangleScopedPackage = (mangledName: string) => {
  return mangledName.includes(separator) ? `@${mangledName.replace(separator, '/')}` : mangledName;
};

export const mangleScopedPackageName = (packageName: string) => {
  const [scope, name] = packageName.split('/');

  if (name) {
    return [scope.replace('@', ''), name].join(separator);
  }

  return scope;
};

interface FormatFilesOptions {
  /**
   * Whether the format command should log output to the console.
   *
   * @defaultValue false
   */
  silent?: boolean;
}

/**
 * Format the files using prettier.
 */
export const formatFiles = async (files: string[], { silent = false }: FormatFilesOptions = {}) => {
  const { stderr, stdout } = await execa('prettier', [...files, '--write']);

  if (silent) {
    return;
  }

  if (stderr) {
    console.error(stderr.trim());
  }

  if (stdout) {
    console.log(stdout.trim());
  }
};

/**
 * A deep merge which only merges plain objects and Arrays. It clones the object
 * before the merge so will not mutate any of the passed in values.
 *
 * To completely remove a key you can use the `Merge` helper class which
 * replaces it's key with a completely new object
 */
export const deepMerge = <GType extends object = any>(...objects: Array<Partial<GType>>): GType => {
  return merge<GType>(objects as any, { isMergeableObject: is.plainObject });
};

export interface IsNodeModuleRequireOptions {
  /**
   * Whether to simulate windows.
   *
   * @default undefined
   */
  windows?: boolean;
}

export interface ParseFilePath {
  /**
   * True when the file path provided is an absolute path.
   */
  isAbsolute: string;

  /**
   * True when the file path potentially refers to a node module package.
   */
  isPackage: string;
}

/**
 * Determine whether the path provided should be resolved from the node modules
 * or directly from the path.
 */
export const parseFilePath = (file: string, { windows }: IsNodeModuleRequireOptions = {}) => {
  const isWindows = windows ?? process.platform === 'win32';
  const parser = isWindows ? path.win32.parse : path.parse;
  const parsedPath = parser(file);

  return {
    ...parsedPath,
    isAbsolute: Boolean(parsedPath.root),
    isPackage: !file.startsWith('.') && !parsedPath.root,
  };
};

/**
 * A cached value for the packages to prevent rerunning the command multiple times.
 */
let packages: MonotsPackage[];

const defaultMonotsPackage: Required<MonotsPackageConfig> = {
  tsconfig: false,
  type: PackageType.Library,
};

/**
 * Get all the workspace packages.
 */
export const getWorkspacePackages = async () => {
  if (packages) {
    return packages;
  }

  const pkgs = await getWorkspaces();
  packages = (pkgs ?? []).map<MonotsPackage>(({ config, dir, name }) => ({
    dir,
    name,
    packageJson: config,
    monotsConfig: deepMerge(defaultMonotsPackage, (config as PackageJson).monotsPackage ?? {}),
  }));

  return packages;
};

/**
 * A list of files that will be prettified at the end of the current process.
 *
 * This prevents prettier being run multiple times and slowing down performance.
 */
let filesToPrettify: string[] = [];

/**
 * Add a path or list of paths to the list of files to be prettified.
 *
 * These should all resolve exactly to files that we want to be prettified.
 */
export const addToPrettifyList = (...filePaths: string[]) => filesToPrettify.push(...filePaths);

/**
 * Prettify all the files added to the list and then reset the list.
 */
export const prettifyFiles = async () => {
  await formatFiles(filesToPrettify, { silent: true });
  filesToPrettify = [];
};

/**
 * Get the relative file path and always include the opening dot and forward slash.
 *
 * @remarks
 *
 * Solve the relative path from {from} to {to}. At times we have two absolute paths, and we need to
 * derive the relative path from one to the other. This is actually the reverse transform of
 * path.resolve.
 */
export const relative = (from: string, to: string) => {
  const relativePath =  path.relative(from, to)
  return relativePath.startsWith('../') ? relativePath : `./${  relativePath}`;
}
