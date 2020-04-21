import {tsconfigResolver} from 'tsconfig-resolver';
import { pathsToModuleNameMapper } from 'ts-jest/utils';

const { MONOTS_TSCONFIG, MONOTS_CWD = process.cwd() } = process.env;
const { config } = tsconfigResolver({cwd: MONOTS_CWD, filePath: MONOTS_TSCONFIG });

export const transform = {
  '^.+\\.[tj]sx?$': [require.resolve('babel-jest'), { rootMode: 'upward' }],
};

export const moduleFileExtensions = ['ts', 'tsx', 'json', 'js', 'jsx', 'node'];

export const moduleNameMapper = pathsToModuleNameMapper(
  config?.compilerOptions?.paths ?? {} /*, { prefix: '<rootDir>/' } */,
);

export const globals = {

};
