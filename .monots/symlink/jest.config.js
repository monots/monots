export default {
  clearMocks: true,
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'node'],
  globals: {
    __DEV__: true,
    __TEST__: true,
    __E2E__: false,
  },
  testRegex: '/__tests__/.*\\.spec\\.tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { jsc: { target: 'es2020' } }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  testRunner: 'jest-circus/runner',
  testPathIgnorePatterns: ['/node_modules/'],
  errorOnDeprecated: true,
  // testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/packages/monots__cli/__fixtures__/'],
};
