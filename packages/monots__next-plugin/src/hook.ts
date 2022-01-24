import { type LoaderDefinitionFunction } from 'webpack';

/**
 * Provide a mock loader for the `@swc/register` node_module. When it is imported
 * via the monots module it shouldn't do anything (noop).
 */
const loader: LoaderDefinitionFunction = function () {
  this.callback(
    null,
    `module.exports = () => {};
    exports.revert = () => {};
  `,
  );
};

export = loader;
