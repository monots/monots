import { BaseTemplate, MonorepoTemplate, PackageTemplate, PackageType } from '@monots/core';
import { copy, move, readFile, writeFile } from 'fs-extra';
import Mustache from 'mustache';
import { resolve } from 'path';
import { coerce, gte } from 'semver';
import sh from 'shelljs';

// Side effect
Mustache.escape = value => value;

/**
 * Get the package directory from this package.
 */
export const packageDirectory = (...paths: string[]) => resolve(__dirname, '../', ...paths);

/**
 * The template types.
 */
export const enum TemplateType {
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
      transformations.push(...to.map(to => move(dest(from), dest(to))));
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
    updates.push(updateFile(dest(file), contents => Mustache.render(contents, context)));
  }

  await Promise.all(updates);
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
    const { stdout } = sh.exec(command, { silent: true });
    const author = stdout.trim();

    if (author) {
      return author;
    }
  }

  return undefined;
};

/**
 * If yarn isn't installed this will thrown an error.
 */
export const getYarnVersion = () => {
  const { stdout, stderr } = sh.exec('yarn --version', { silent: true });
  const version = coerce(stdout.trim())?.version;

  if (stderr || !version) {
    throw new Error('Yarn is not installed. Please install to continue.');
  }

  return version;
};

/**
 * Get the yarn version command.
 */
export const yarnSetVersionCommand = (version: string) => {
  if (gte(version, '2.0.0')) {
    return 'yarn set version berry';
  } else {
    return 'policies set-version ^1';
  }
};

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
  extraContext: ctx => ctx,
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
  extraContext: ctx => ctx,
};
