import { findAndLoadTsConfig } from '@monots/core';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

const { MONOTS_TSCONFIG, MONOTS_CWD = process.cwd() } = process.env;
const { config } = findAndLoadTsConfig(MONOTS_CWD, MONOTS_TSCONFIG);

export const transform = {
  '^.+\\.[tj]sx?$': [require.resolve('ts-jest'), { rootMode: 'upward' }],
};

export const moduleFileExtensions = ['ts', 'tsx', 'json', 'js', 'jsx', 'node'];

export const moduleNameMapper = pathsToModuleNameMapper(
  config?.compilerOptions?.paths ?? {} /*, { prefix: '<rootDir>/' } */,
);

export const globals = {
  'ts-jest': {
    babelConfig: true,
  },
};
