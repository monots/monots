import { existsSync, lstatSync, readFileSync, statSync } from 'fs';
import JSON5 from 'json5';
import { dirname, join, resolve } from 'path';
import StripBom from 'strip-bom';

import { parseFilePath } from './helpers';
import { TsConfigJson } from './tsconfig-json';

export interface TsConfigLoaderResult {
  path: string | undefined;
  config: TsConfigJson | undefined;
}

export interface TsConfigLoaderParams {
  getEnv: (key: string) => string | undefined;
  cwd: string;
  loadSync?(cwd: string, filename?: string): TsConfigLoaderResult;
}

const walkForTsConfig = (directory: string): string | undefined => {
  const configPath = join(directory, './tsconfig.json');
  if (existsSync(configPath)) {
    return configPath;
  }

  const parentDirectory = join(directory, '../');

  // If we reached the top
  if (directory === parentDirectory) {
    return undefined;
  }

  return walkForTsConfig(parentDirectory);
};

export const resolveConfigPath = (cwd: string, filename?: string): string | undefined => {
  if (filename) {
    const absolutePath = lstatSync(filename).isDirectory()
      ? resolve(filename, 'tsconfig.json')
      : resolve(cwd, filename);

    return absolutePath;
  }

  if (statSync(cwd).isFile()) {
    return resolve(cwd);
  }

  const configAbsolutePath = walkForTsConfig(cwd);
  return configAbsolutePath ? resolve(configAbsolutePath) : undefined;
};

const loadTsConfig = (configFilePath: string): TsConfigJson | undefined => {
  if (!existsSync(configFilePath)) {
    return undefined;
  }

  const configString = readFileSync(configFilePath, 'utf8');
  const cleanedJson = StripBom(configString);
  const config: TsConfigJson = JSON5.parse(cleanedJson);
  let extendedConfig = config.extends;

  if (!extendedConfig) {
    return config;
  }

  let base: TsConfigJson;

  if (parseFilePath(extendedConfig).isPackage) {
    const newConfigPath = require.resolve(extendedConfig);
    const lstats = lstatSync(newConfigPath);

    if (lstats.isDirectory()) {
      extendedConfig = join(newConfigPath, 'tsconfig.json');
    } else if (lstats.isFile()) {
      extendedConfig = newConfigPath;
    } else if (lstatSync(`${newConfigPath}.json`).isFile()) {
      extendedConfig = `${newConfigPath}.json`;
    }

    base = loadTsConfig(extendedConfig) ?? {};
  } else {
    if (!extendedConfig.endsWith('.json')) {
      extendedConfig += '.json';
    }

    const currentDir = dirname(configFilePath);
    base = loadTsConfig(join(currentDir, extendedConfig)) ?? {};
  }

  // baseUrl should be interpreted as relative to the base tsconfig,
  // but we need to update it so it is relative to the original tsconfig being loaded
  if (base?.compilerOptions?.baseUrl) {
    const extendsDir = dirname(extendedConfig);
    base.compilerOptions.baseUrl = join(extendsDir, base.compilerOptions.baseUrl);
  }

  return {
    ...base,
    ...config,
    compilerOptions: {
      ...base.compilerOptions,
      ...config.compilerOptions,
    },
  };
};

export function findAndLoadTsConfig(
  cwd: string = process.cwd(),
  filename?: string,
): TsConfigLoaderResult {
  const configPath = resolveConfigPath(cwd, filename);

  if (!configPath) {
    return {
      path: undefined,
      config: undefined,
    };
  }
  const config = loadTsConfig(configPath);

  return {
    path: configPath,
    config,
  };
}
