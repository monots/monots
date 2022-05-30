import { REGEX_EXPORT_DEFAULT, REGEX_EXPORT_NAMED } from './constants.js';
import { matchAll } from './match-all.js';

/**
 * Test to see if the provided content has a default export.
 *
 * ### Examples
 *
 * All of the following are counted as default exports. The whitespace is also ignored.
 *
 * ```
 * export default function amazing() {}
 * ```
 *
 * ```
 * export { default } from './foo.js';
 * ```
 *
 * ```
 * export { foo as default } from './foo.js';
 * ```
 */
export function hasDefaultExport(content: string): boolean {
  // check for `export default ...`
  const defaultExports = matchAll({ content, regex: REGEX_EXPORT_DEFAULT });

  if (defaultExports.length > 0) {
    return true;
  }

  // taken from https://cs.github.com/unjs/mlly/blob/c5ae321725cbabe230c16c315d474c36eee6a30c/src/analyze.ts#L100
  const namedExports = matchAll({ content, regex: REGEX_EXPORT_NAMED });

  for (const match of namedExports) {
    const names = match.named.exports?.split(/\s*,\s*/g).map((name) => name.trim()) ?? [];

    for (let name of names) {
      // use the alias if it exists
      name = name.replace(/^.*?\sas\s/, '').trim();

      if (name === 'default') {
        return true;
      }
    }
  }

  return false;
}
