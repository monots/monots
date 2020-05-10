const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@monots/core',
  displayName: 'cli',
  testEnvironment: 'node',
};
