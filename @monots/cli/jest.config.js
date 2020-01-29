const config = require('../../support/jest/jest.config');

module.exports = {
  ...config,
  name: '@monots/cli',
  displayName: 'cli',
  testEnvironment: 'node',
};
