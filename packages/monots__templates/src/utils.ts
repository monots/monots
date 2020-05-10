import {
  BaseTemplate,
  MonorepoTemplate,
  PackageJson,
  PackageTemplate,
  PackageType,
} from '@monots/core';
import dargs from 'dargs';
import execa from 'execa';
import filter from 'filter-obj';
import { copy, move, readFile, writeFile } from 'fs-extra';
import Mustache from 'mustache';
import { resolve } from 'path';
import { coerce, gte } from 'semver';
import writePkg from 'write-pkg';

// Side effect
Mustache.escape = (value) => value;

/**
 * Get the package directory from this package.
 */
export const packageDirectory = (...paths: string[]) => resolve(__dirname, '../', ...paths);

/**
 * The template types.
 */
export enum TemplateType {
  Monorepo = 'monorepos',
  Package = 'packages',
}

/**
 * Utility for creating a destination resolver function.
 */
const destinationResolver = (destination: string = process.cwd()) => (...paths: string[]) =>
  resolve(destination, ...paths);

/**
 * Copy the monorepo.
 */
export const copyTemplate = async (templatePath: string, destination = process.cwd()) => {
  await copy(templatePath, destination);
};

/**
 * Rename the provided files.
 *
 * @param renameFiles the files to rename map
 * @param destination the root directory for the destination of files
 */
export const renameFiles = async (
  renameFiles: BaseTemplate['renameFiles'],
  destination = process.cwd(),
) => {
  const transformations: Array<Promise<void>> = [];
  const dest = destinationResolver(destination);

  for (const [from, to] of Object.entries(renameFiles)) {
    if (Array.isArray(to)) {
      transformations.push(...to.map((to) => move(dest(from), dest(to))));
    } else {
      transformations.push(move(dest(from), dest(to)));
    }
  }

  await Promise.all(transformations);
};

/**
 * Update the provided file.
 */
const updateFile = async (filePath: string, updater: (contents: string) => string) => {
  const contents = await readFile(filePath, { encoding: 'utf8' });
  await writeFile(filePath, updater(contents));
};

/**
 * Run through all files that have template variables and template them.
 */
export const templateFiles = async (
  { extraContext, templateFiles }: MonorepoTemplate,
  name: string,
  destination = process.cwd(),
) => {
  const dest = destinationResolver(destination);
  const context = extraContext({ license: 'MIT', name });
  const updates: Array<Promise<void>> = [];

  for (const file of templateFiles) {
    updates.push(updateFile(dest(file), (contents) => Mustache.render(contents, context)));
  }

  await Promise.all(updates);
};

/**
 * Create the package json file.
 */
export const writePackageJson = async (json: PackageJson, destination = process.cwd()) => {
  await writePkg(destination, json as any);
};

interface Options {
  /**
   * The working directory to use for the command.
   *
   * Think of it like a destination.
   */
  cwd?: string;
}

/**
 * If yarn isn't installed this will thrown an error.
 */
export const getYarnVersion = ({ cwd = process.cwd() }: Options = {}) => {
  const { stdout, stderr } = execa.commandSync('yarn --version', { cwd });
  const version = coerce(stdout.trim())?.version;

  if (stderr || !version) {
    throw new Error('Yarn is not installed. Please install to continue.');
  }

  return version;
};

const isYarn2 = ({ cwd = process.cwd() }: Options = {}) =>
  gte(getYarnVersion({ cwd }), '2.0.0', { includePrerelease: true, loose: true });

export interface AddDependencyFlags extends Options {
  dev?: boolean;
  ignoreWorkspaceRootCheck?: boolean;
  peer?: boolean;
  optional?: boolean;
  exact?: boolean;
  tilde?: boolean;
}

/**
 * Install the provided dependencies.
 */
export const addDependencies = async (
  dependencies: string[],
  { cwd, ...options }: AddDependencyFlags,
) => {
  const yarn2 = isYarn2({ cwd: cwd });
  const filteredFlags = filter(
    options,
    (key) => Boolean(options[key]) && !(key === 'ignoreWorkspaceRootCheck' && yarn2),
  ) as Required<AddDependencyFlags>;

  await execa('yarn', dargs({ _: dependencies, ...filteredFlags }), { cwd });
};

const gitMessages = {
  conventional: 'chore: initial commit with monots',
  simple: 'Initialize git with monots',
};

export type CommitType = keyof typeof gitMessages;

export interface InitializeGitOptions extends Options {
  /**
   * The message type to be used.
   *
   * If left blank no initial commit will be made.
   */
  commitType?: CommitType;
}

export const initializeGit = async ({ cwd = process.cwd(), commitType }: InitializeGitOptions) => {
  await execa.command('git init', { cwd });

  if (!commitType) {
    return;
  }

  await execa.command(`git commit -m "${gitMessages[commitType]}"`, { cwd });
};

/**
 * Get the author name.
 */
export const getAuthorName = () => {
  const commands = [
    'npm config get init-author-name',
    'git config --global user.name',
    'npm config get init-author-email',
    'git config --global user.email',
  ];

  for (const command of commands) {
    const { stdout } = execa.commandSync(command);
    const author = stdout.trim();

    if (author) {
      return author;
    }
  }

  return undefined;
};

/**
 * Get the yarn version command.
 */
export const yarnSetVersionCommand = (version: string, cwd = process.cwd()) =>
  isYarn2({ cwd }) ? `yarn set version ${version}` : `yarn policies set-version ${version}`;

/**
 * The default Monorepo template to use.
 */
export const defaultMonorepoTemplate: MonorepoTemplate = {
  name: 'empty',
  templateFiles: [],
  renameFiles: {},
  path: packageDirectory(TemplateType.Monorepo, 'empty'),
  devDependencies: ['@types/jest', 'husky', 'monots', 'tslib', 'typescript', 'jest'],
  createPackageJson: () => {
    return { name: 'root' };
  },
  extraContext: (ctx) => ctx,
};

/**
 * The default packages template to use.
 */
export const defaultPackageTemplate: PackageTemplate = {
  name: 'empty',
  templateFiles: [],
  renameFiles: {},
  path: packageDirectory(TemplateType.Package, 'empty'),
  devDependencies: [],
  dependencies: [],
  type: PackageType.Library,
  createPackageJson: () => {
    return { name: 'root' };
  },
  extraContext: (ctx) => ctx,
};
