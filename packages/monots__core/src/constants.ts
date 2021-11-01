/**
 * The output folder.
 */
export const OUTPUT_FOLDER = 'dist';

/**
 * The default source folder.
 */
export const SOURCE_FOLDER_NAME = 'src';

/**
 * Identifier for the default source folder.
 */
export const SOURCE_FOLDER_IDENTIFIER = '__source__';

/**
 * The name of the command.
 */
export const NAME = 'monots';

/**
 * The version of TypeScript to use in the monorepo - used in init.
 */
export const TYPESCRIPT_VERSION = '4.4.3';

/**
 * The default browserslist configuration to use if none specified for the project.
 */
export const DEFAULT_BROWSERSLIST = ['since 2020'];

/**
 * The field extensions for each type of build.
 */
export const FIELD_EXTENSIONS = {
  main: '.cjs.js',
  module: '.esm.js',
  browser: '.browser.esm.js',
  types: '.d.ts',
} as const;
