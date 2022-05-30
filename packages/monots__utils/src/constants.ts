/**
 * Check the provided content for a default export.
 *
 * Taken from https://github.com/unjs/mlly/blob/c5ae321725cbabe230c16c315d474c36eee6a30c/src/analyze.ts#L61
 */
export const REGEX_EXPORT_DEFAULT = /\bexport\s+default\s+/g;

/**
 * Check for all named exports which can also contain default exports.
 *
 * ### Examples
 *
 * Both of the following are default exports.
 *
 * ```
 * export { default } from './foo.js';
 * ```
 *
 * ```
 * export { foo as default } from './foo.js';
 * ```
 *
 * ### Other
 *
 * Taken from https://github.com/unjs/mlly/blob/c5ae321725cbabe230c16c315d474c36eee6a30c/src/analyze.ts#L59
 */
export const REGEX_EXPORT_NAMED =
  /\bexport\s+{(?<exports>[^}]+)}(\s*from\s*["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][^\n]*)?/g;
