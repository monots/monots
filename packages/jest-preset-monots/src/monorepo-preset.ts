import { getConfigSync, get } from '@monots/core';

const { supportDirectory, rootDirectory, packageJson } = getConfigSync();

const workspaceProjects = (Array.isArray(packageJson.workspaces)
  ? packageJson.workspaces
  : typeof packageJson.workspaces === 'object'
  ? packageJson.workspaces.packages
  : []
).map(pattern => `<rootDir>/${pattern}`);

export const cacheDirectory = '<rootDir>/.jest';
export const collectCoverage = true;
export const collectCoverageFrom = ['**/*.{ts,tsx}', '!**/*.d.ts'];
export const coveragePathIgnorePatterns = [
  '/node_modules/',
  '\\.d.ts',
  '/__mocks__/',
  '/__tests__/',
  '/__fixtures__/',
  ...(supportDirectory !== rootDirectory ? [supportDirectory] : []),
  'jest\\.*\\.ts',
];
export const coverageReporters = ['json', 'lcov', 'text-summary', 'clover'];
export const projects = [...workspaceProjects];

export const testRunner = 'jest-circus/runner';
export const watchPlugins = ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'];

export { moduleFileExtensions } from './package-preset';
