import fastGlob from 'fast-glob';
import * as fs from 'fs-extra';
import nodePath from 'path';

import { FatalError } from './errors';
import { Item } from './item';
import { Package } from './package';
import { promptInput } from './prompt';
import { JSONValue } from './utils';
import { validateIncludedFiles } from './validate-included-files';

const allSettled = (promises: Array<Promise<any>>) =>
  Promise.all(
    promises.map((promise) =>
      promise.then(
        (value) => ({ status: 'fulfilled' as const, value }),
        (error) => ({ status: 'rejected' as const, reason: error }),
      ),
    ),
  );

export class Project extends Item<{
  name?: JSONValue;
  workspaces?: JSONValue;
  monots: {
    globals?: Record<string, string>;
    packages?: JSONValue;
    distFilenameStrategy?: JSONValue;
    ___experimentalFlags_WILL_CHANGE_IN_PATCH: {
      logCompiledFiles?: JSONValue;
      typeScriptProxyFileWithImportEqualsRequireAndExportEquals?: JSONValue;
    };
  };
}> {
  get experimentalFlags() {
    const config = this.json.monots.___experimentalFlags_WILL_CHANGE_IN_PATCH || {};
    return {
      logCompiledFiles: !!config.logCompiledFiles,
      typeScriptProxyFileWithImportEqualsRequireAndExportEquals: !!config.typeScriptProxyFileWithImportEqualsRequireAndExportEquals,
    };
  }
  get configPackages(): string[] {
    if (this.json.monots.packages === undefined) {
      return ['.'];
    }

    if (
      Array.isArray(this.json.monots.packages) &&
      this.json.monots.packages.every((x) => typeof x === 'string')
    ) {
      return this.json.monots.packages as string[];
    }

    throw new FatalError(
      'The packages option for this project is not an array of globs',
      this.name,
    );
  }
  static async create(directory: string, isFix = false): Promise<Project> {
    const filePath = nodePath.join(directory, 'package.json');
    const contents = await fs.readFile(filePath, 'utf-8');
    const project = new Project(filePath, contents, new Map());
    project.packages = await project._packages(isFix);

    return project;
  }

  get name(): string {
    if (typeof this.json.name !== 'string') {
      throw new FatalError('The name field on this project is not a string', this.directory);
    }

    return this.json.name;
  }

  packages!: Package[];

  async _packages(isFix: boolean): Promise<Package[]> {
    // suport bolt later probably
    // maybe lerna too though probably not
    if (!this.json.monots.packages && this.json.workspaces) {
      let workspaces;

      if (Array.isArray(this.json.workspaces)) {
        workspaces = this.json.workspaces;
      } else if (Array.isArray((this.json.workspaces as any).packages)) {
        workspaces = (this.json.workspaces as any).packages;
      }

      const packages = await promptInput(
        'what packages should monots build?',
        this,
        workspaces.join(','),
      );

      this.json.monots.packages = packages.split(',');

      await this.save();
    }

    const filenames = await fastGlob(this.configPackages, {
      cwd: this.directory,
      onlyDirectories: true,
      absolute: true,
    });

    const packages: Package[] = [];

    await Promise.all(
      filenames.map(async (x) => {
        try {
          packages.push(await Package.create(x, this, isFix));
        } catch (error) {
          if (error.code === 'ENOENT' && error.path === nodePath.join(x, 'package.json')) {
            return;
          }

          throw error;
        }
      }),
    );

    const errored = (await allSettled(packages.map((pkg) => validateIncludedFiles(pkg)))).find(
      (result) => result.status === 'rejected',
    );

    if (errored) {
      // TS can't refine type based on .find predicate
      throw (errored as any).reason;
    }

    return packages;
  }
}
