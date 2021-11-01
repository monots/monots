import { getPackages } from '@manypkg/get-packages';
import is from '@sindresorhus/is';
import chalk from 'chalk';
import del from 'del';
import detectIndent from 'detect-indent';
import execa from 'execa';
import glob from 'fast-glob';
import yaml from 'js-yaml';
import { loadJsonFile } from 'load-json-file';
import fs from 'node:fs/promises';
import path from 'node:path';
import parseJson from 'parse-json';
import type { JsonObject } from 'type-fest';
import { writeJsonFile } from 'write-json-file';

import { DEFAULT_BROWSERSLIST, NAME, TYPESCRIPT_VERSION } from '../constants.js';
import {
  BatchError,
  buildPackageWithRollup,
  FatalError,
  fileExists,
  getInstaller,
  InstallerType,
} from '../helpers/index.js';
import { Project, ProjectMonots } from '../schema.js';
import type { References, TsConfigJson } from '../types.js';
import { BaseEntity, BaseEntityProps } from './base-entity.js';
import { PackageEntity } from './package-entity.js';

interface ProjectEntityProps extends BaseEntityProps<Project> {
  /**
   * The indentation to use for all the package.json files. The project root is
   * used to determine this for all entities.
   *
   * @default '  '
   */
  indent: string;
}

interface CreateProjectEntityProps {
  /**
   * The directory to load the package.json file from.
   */
  cwd: string;

  /**
   * The version of the cli command used.
   *
   * @default `0.0.0`
   */
  version?: string;

  /**
   * Whether to skip packages.
   *
   * @default false
   */
  skipPackages?: boolean;
}

export class ProjectEntity extends BaseEntity<Project> {
  static async create(props: CreateProjectEntityProps): Promise<ProjectEntity> {
    const { cwd, skipPackages = false, version = '0.0.0' } = props;
    const packageJsonPath = path.join(cwd, 'package.json');
    const contents = await fs.readFile(packageJsonPath, 'utf-8');
    const indent = detectIndent(contents).indent || '  ';
    const json = parseJson(contents, packageJsonPath);
    const project = new ProjectEntity({ map: new Map(), indent, json, path: packageJsonPath });
    project.version = version;

    if (!skipPackages) {
      await project.loadPackages();
    }

    return project;
  }

  version = '0.0.0';
  packages: PackageEntity[] = [];
  indent: string;
  #initialized: boolean;
  #installer: InstallerType | undefined;

  get initialized(): boolean {
    return this.#initialized;
  }

  get browserslist(): string | string[] {
    return this.json.browserslist ?? DEFAULT_BROWSERSLIST;
  }

  get name(): string {
    if (typeof this.json.name !== 'string') {
      throw new FatalError(`The name field on this project is not a string`, 'root');
    }

    return this.json.name;
  }

  get rootTsConfigPath(): string {
    return path.join(this.directory, this.monots.tsconfigPath);
  }

  get packagesFolder(): string {
    return path.join(this.directory, this.monots.packagesFolder);
  }

  #packagePaths: Record<string, string> | undefined;

  /**
   * An object containing the package name -> absolute path.
   *
   * This is used to created tsconfig references.
   */
  get packagePaths(): Record<string, string> {
    if (this.#packagePaths) {
      return this.#packagePaths;
    }

    this.#packagePaths = {};

    for (const pkg of this.packages) {
      this.#packagePaths[pkg.name] = pkg.directory;
    }

    return this.#packagePaths;
  }

  get monots(): Required<ProjectMonots> {
    return { ...DEFAULT_MONOTS_PROJECT_OPTIONS, ...this.json.monots };
  }

  private constructor(props: ProjectEntityProps) {
    const { json, map, path, indent } = props;
    super({ json, map, path, struct: Project });
    this.#initialized = !!this.json.monots?.packages;
    this.indent = indent;
  }

  /**
   * Prepare the project for usage in development mode.
   *
   * This is used by the `monots prepare` command.
   */
  async prepare(): Promise<void> {
    const promises: Array<Promise<void>> = [];

    for (const pkg of this.packages) {
      promises.push(pkg.prepare());
    }

    await Promise.all(promises);
  }

  async validate(): Promise<void> {
    const promises: Array<Promise<void>> = [];
    const errors: FatalError[] = [];

    for (const pkg of this.packages) {
      promises.push(
        pkg.validate().then((packageErrors) => {
          errors.push(...packageErrors);
        }),
      );
    }

    await Promise.all(promises);

    if (errors.length === 0) {
      return;
    }

    throw new BatchError(errors);
  }

  /**
   * Build all the entrypoints.
   */
  async build(): Promise<void> {
    const errors: FatalError[] = [];
    const promises: Array<Promise<void>> = [];

    for (const pkg of this.packages) {
      const promise = buildPackageWithRollup(pkg).catch((error) => {
        if (error instanceof BatchError) {
          errors.push(...error.errors);
        } else {
          errors.push(error);
        }
      });

      promises.push(promise);
    }

    await Promise.all(promises);

    if (errors.length > 0) {
      throw new BatchError(
        errors.sort((a, b) => (a.scope + a.message).localeCompare(b.scope + b.message)),
      );
    }
  }

  /**
   * Run the installer for this project.
   */
  async install(): Promise<void> {
    this.#installer ??= await getInstaller(this.directory);
    await execa(this.#installer, ['install'], {
      stdin: 'inherit',
      stderr: 'inherit',
      stdout: 'inherit',
    });
  }

  async cleanDist(pattern = ''): Promise<void> {
    const promises: Array<Promise<unknown>> = [];

    for (const pkg of this.packages) {
      promises.push(del(`${path.join(pkg.dist, pattern)}`));
    }

    await Promise.all(promises);
  }

  /**
   * This just returns the current `json`.
   */
  createJson(): Project {
    return this.json;
  }

  /**
   * Save the json values for the nested packages.
   *
   * Returns `true` when a fix was made.
   */
  async savePackagesJson(): Promise<boolean> {
    const promises: Array<Promise<boolean>> = [];

    for (const pkg of this.packages) {
      promises.push(pkg.saveJson());
    }

    const values = await Promise.all(promises);
    return values.some((value) => value);
  }

  /**
   * Save the json value for the `monots` project.
   */
  override async saveJson(): Promise<boolean> {
    const json = this.json;

    if (json.monots?.packages?.length) {
      return false;
    }

    json.monots = { ...json.monots, packages: await this.getDefaultWorkspaces() };

    // Default to using modules.

    if (!json.type) {
      json.type = 'module';
    }

    if (!json.scripts?.postinstall) {
      json.scripts = json.scripts ?? {};
      json.scripts.postinstall = `${NAME} prepare`;
    }

    if (!json.dependencies?.typescript) {
      json.dependencies ??= {};
      json.dependencies.typescript = `^${TYPESCRIPT_VERSION}`;
    }

    if (!json.dependencies?.['@monots/cli']) {
      json.dependencies['@monots/cli'] = `^${this.version}`;
    }

    await writeJsonFile(this.path, json, { detectIndent: true });
    return true;
  }

  async getDefaultWorkspaces(): Promise<string[]> {
    let workspaces: string[] | undefined;
    const jsonWorkspaces = this.json.workspaces;

    if (is.array(jsonWorkspaces)) {
      workspaces = jsonWorkspaces;
    } else if (Array.isArray(jsonWorkspaces?.packages)) {
      workspaces = jsonWorkspaces?.packages as string[];
    }

    if (workspaces) {
      return workspaces;
    }

    const { tool } = await getPackages(this.directory);

    if (tool === 'lerna') {
      const lerna: { packages: string[] | undefined } = await loadJsonFile(
        path.join(this.directory, 'lerna.json'),
      );
      workspaces = lerna.packages;
    } else if (tool === 'pnpm') {
      const pnpm = yaml.load(
        await fs.readFile(path.join(this.directory, 'pnpm-workspace.yaml'), { encoding: 'utf-8' }),
      );

      workspaces = is.plainObject(pnpm) ? (pnpm.packages as string[]) : undefined;
    }

    if (!workspaces) {
      throw new FatalError(
        chalk`Currently {bold monots} only supports workspace project using yarn, npm, pnpm or lerna.`,
        this.name,
      );
    }

    return workspaces;
  }

  /**
   * Create the package entities which are managed by monots.
   */
  async loadPackages(): Promise<void> {
    const directories = await glob(this.monots.packages, {
      // ignore: ['**/node_modules/**', 'node_modules/**'],
      cwd: this.directory,
      onlyDirectories: true,
      absolute: true,
    });

    const promises: Array<Promise<void>> = [];
    const packages: PackageEntity[] = [];

    for (const directory of directories) {
      // Create all the PackageEntities where the directory contains a parent package.json.
      const promise = fileExists(path.join(directory, 'package.json'))
        .then(async (exists) => {
          if (!exists) {
            return;
          }

          const entity = await PackageEntity.create({ directory, project: this });
          packages.push(entity);
        })
        .catch((error) => {
          throw new FatalError(
            chalk`There was a problem creating a package for the directory: ${directory}\n\n{bold.red ${error.message} }`,
            this.name,
          );
        });

      promises.push(promise);
    }

    await Promise.all(promises);
    this.packages = packages;
  }

  /**
   * Create the tsconfig files for the project.
   */
  async saveTsConfigFiles(): Promise<void> {
    // Store all the references to the individual tsconfig files.
    const references: References[] = [];

    // Top level tsconfig.json which is a reference json file.
    const rootTsConfig: TsConfigJson = {
      extends: this.monots.baseTsconfig,
      include: [],
      files: [],
      ...(this.monots.tsconfig as JsonObject),
      references,
    };

    const promises: Array<Promise<void>> = [];

    for (const pkg of this.packages) {
      promises.push(
        pkg.createTsConfigs().then((paths) => {
          references.push(...paths.map((path) => ({ path })));
        }),
      );
    }

    await Promise.all(promises);
    references.sort((a, z) => a.path.localeCompare(z.path));
    await writeJsonFile(this.rootTsConfigPath, rootTsConfig, { detectIndent: true });
  }
}

const DEFAULT_MONOTS_PROJECT_OPTIONS: Required<ProjectMonots> = {
  tool: 'rollup-swc',
  packages: [],
  baseTsconfig: '@monots/tsconfig/tsconfig.json',
  packageTsConfigs: {},
  tsconfigPath: './tsconfig.json',
  packagesFolder: 'packages',
  tsconfig: {},
};
