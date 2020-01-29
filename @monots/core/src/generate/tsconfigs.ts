import { dirname, join, relative } from 'path';
import writeJSON from 'write-json-file';

import { getConfig } from '../config';
import { AUTO_GENERATED_FLAG } from '../constants';
import { addToPrettifyList, getWorkspacePackages, parseFilePath } from '../helpers';
import { TsConfigJson } from '../tsconfig-json';
import { MonotsPackage, PackageType, UnwrapPromise } from '../types';

const canBuildPackage = (pkg: MonotsPackage) => {
  return [PackageType.Library, PackageType.CLI, PackageType.E2E].includes(pkg.monotsConfig.type);
};

/**
 * Generate the `tsconfig.base.json` file.
 *
 * This file will have the paths section automatically filled with the required files.
 */
export const generateBaseTsConfig = async (): Promise<GenerateTypeScriptReturn> => {
  const [
    packages,
    {
      tsconfigBasePath: tsconfigPathsName,
      rootDirectory,
      relativePathFromRootToPackage,
      tsconfigBaseExtends,
      absolutePathFromRelative,
    },
  ] = await Promise.all([getWorkspacePackages(), getConfig()]);

  const paths = packages
    .filter(pkg => pkg.packageJson.types)
    .reduce((acc, pkg) => {
      const packagePath = relativePathFromRootToPackage(pkg);
      return {
        ...acc,
        [pkg.name]: [`${packagePath}/src/index.ts`],
        [`${pkg.name}/lib/*`]: [`${packagePath}/src/*`],
      };
    }, {});

  const { isPackage, isAbsolute } = parseFilePath(tsconfigBaseExtends);
  const extendsPath = isPackage
    ? tsconfigBaseExtends
    : relative(
        dirname(tsconfigPathsName),
        isAbsolute ? tsconfigBaseExtends : absolutePathFromRelative(tsconfigBaseExtends),
      );
  const baseUrl = relative(dirname(tsconfigPathsName), rootDirectory);
  const compilerOptions = { baseUrl, paths };
  const json = {
    ...AUTO_GENERATED_FLAG,
    extends: extendsPath,
    compilerOptions,
  };

  return {
    data: [json],
    paths: [tsconfigPathsName],
    write: async () => {
      await writeJSON(tsconfigPathsName, json);
      addToPrettifyList(tsconfigPathsName);
    },
  };
};

export const generatePackageTsConfigs = async (): Promise<GenerateTypeScriptReturn> => {
  const [packages, { tsconfigBuildName, tsconfigBuild, tsconfigBasePath }] = await Promise.all([
    getWorkspacePackages(),
    getConfig(),
  ]);

  const dependencyMap: Map<string, string> = new Map();

  for (const pkg of packages) {
    // Only typed packages should be included in references.
    if (!pkg.packageJson.types || !canBuildPackage(pkg)) {
      continue;
    }
    dependencyMap.set(pkg.name, pkg.dir);
  }

  const fn = async (pkg: MonotsPackage) => {
    const references: TsConfigJson.References[] = [];
    const dependencies = Object.keys(pkg.packageJson.dependencies ?? {});

    for (const dependency of dependencies) {
      const dependencyDirectory = dependencyMap.get(dependency);

      if (!dependencyDirectory) {
        return;
      }

      const path = join(relative(pkg.dir, dependencyDirectory), tsconfigBuildName);
      references.push({ path });
    }

    const tsConfigProdPath = join(pkg.dir, tsconfigBuildName);
    const options = pkg.packageJson.types
      ? {}
      : { declaration: false, declarationMap: false, composite: false };

    const json = {
      ...AUTO_GENERATED_FLAG,
      extends: relative(pkg.dir, tsconfigBasePath),
      ...tsconfigBuild,
      compilerOptions: {
        ...(tsconfigBuild.compilerOptions ?? {}),
        ...options,
      },
      references,
    };

    return {
      json,
      path: tsConfigProdPath,
      write: async () => {
        await writeJSON(tsConfigProdPath, json);
        addToPrettifyList(tsConfigProdPath);
      },
    };
  };

  const items = await Promise.all(packages.map(fn));

  const data: Array<Extract<UnwrapPromise<ReturnType<typeof fn>>, object>> = [];

  for (const item of items) {
    if (!item) {
      continue;
    }
    data.push(item);
  }

  return {
    paths: data.map(item => item.path),
    data: data.map(item => item.json),
    write: async () => {
      await Promise.all(data.map(item => item?.write()));
    },
  };
};

/**
 * Generate the main tsconfig build file. Which exists at the root and is
 * responsible for building all typescript packages in the project.
 */
export const generateMainTsConfig = async (): Promise<GenerateTypeScriptReturn> => {
  const [packages, config] = await Promise.all([getWorkspacePackages(), getConfig()]);

  const json: TsConfigJson = {
    ...AUTO_GENERATED_FLAG,
    files: [],
    references: [],
    exclude: config.tsconfigBuild.exclude,
  };

  for (const pkg of packages) {
    if (!canBuildPackage(pkg)) {
      continue;
    }

    const path = join(config.relativePathFromRootToPackage(pkg, config.tsconfigBuildName));
    json.references?.push({ path });
  }

  const configPath = config.absolutePathFromRelative(config.tsconfigBuildName);

  return {
    data: [json],
    paths: [configPath],
    write: async () => {
      await writeJSON(configPath, json);
      addToPrettifyList(configPath);
    },
  };
};

export interface GenerateTypeScriptReturn {
  write(): Promise<void>;
  paths: string[];
  data: TsConfigJson[];
}
