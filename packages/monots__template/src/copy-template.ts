import template from 'lodash.template';
import * as path from 'node:path';
import { Transform } from 'node:stream';
import normalizePath from 'normalize-path';
import type { CopyOperation } from 'recursive-copy';
import copy from 'recursive-copy';
import { objectEntries } from 'ts-extras';

import type { MonotsTemplateConfig, MonotsTemplateProps } from './types.js';

export interface CopyTemplateProps
  extends Pick<MonotsTemplateConfig, 'customTemplateFiles'>,
    Pick<MonotsTemplateProps, 'source' | 'destination'> {
  /**
   * Whether to overwrite the destination file if it exists.
   *
   * @default undefined
   */
  overwrite?: boolean;

  /**
   * The template variables to use when copying the template.
   */
  variables: Record<string, any>;

  /**
   * Name of the relative source file and the desired relative destination. For
   * example `npm` doesn't allow publishing a .gitignore file or `.npmrc` so we
   * can add the following to rename the files.
   *
   * ```
   * copyTemplate({
   *   rename: {
   *     gitignore: '.gitignore',
   *     npmrc: '.npmrc'
   *   },
   *   input
   *   output,
   *   variables
   * });
   * ```
   */
  rename?: Record<string, string>;

  /**
   * Paths to ignore when copying the template. These are the names before transformation.
   */
  ignore?: string[];
}

/**
 * Returns an array filled with the copy results.
 *
 * ```
 * [
 *  {
 *     "src": "/path/to/src",
 *     "dest": "/path/to/dest",
 *     "stats": <Stats>
 *  },
 *  {
 *     "src": "/path/to/src/file.txt",
 *     "dest": "/path/to/dest/file.txt",
 *     "stats": <Stats>
 *  },
 *  {
 *     "src": "/path/to/src/subfolder",
 *     "dest": "/path/to/dest/subfolder",
 *     "stats": <Stats>
 *  },
 *  {
 *     "src": "/path/to/src/subfolder/nested.txt",
 *     "dest": "/path/to/dest/subfolder/nested.txt",
 *     "stats": <Stats>
 *   }
 * ]
 * ```
 */
export async function copyTemplate(props: CopyTemplateProps): Promise<CopyOperation[]> {
  const rename = normalizeObjectPaths(props.rename ?? {});
  const customTemplateFiles = normalizeObjectPaths(props.customTemplateFiles ?? {});
  const ignore = new Set((props.ignore ?? []).map((path) => normalize(path)));

  return copy(props.source, props.destination, {
    overwrite: props.overwrite,
    junk: true,
    dot: true,
    filter: (filename) => {
      filename = normalize(filename);
      return !ignore.has(filename);
      // return true;
    },
    rename: (filename) => {
      filename = normalize(filename);
      filename = rename[filename] ?? filename;
      const customTemplate = customTemplateFiles[filename];

      // Dont' rename the file when it's a custom template file with `renameTo`
      // is false.
      if (customTemplate === false || customTemplate?.renameTo === false) {
        return filename;
      }

      return customTemplate?.renameTo
        ? customTemplate.renameTo
        : template(filename)(props.variables).replace(/.template$/, '');
    },
    transform: (filename) => {
      filename = normalize(filename);
      const customTemplate = customTemplateFiles[filename];

      if (
        path.extname(filename) !== '.template' ||
        customTemplate === false ||
        customTemplate?.process === false
      ) {
        return null;
      }

      return new Transform({
        transform: (chunk, _encoding, done) => {
          const output = template(chunk.toString())(props.variables);
          done(undefined, output);
        },
      });
    },
  });
}

/**
 * Strips the leading `./` from the path.
 */
function normalize(filename: string) {
  return path.normalize(normalizePath(filename));
}

/**
 * Normalizes the paths in the `rename` object.
 */
function normalizeObjectPaths<Paths extends Record<string, any>>(paths: Paths): Paths {
  const normalized = Object.create(null);

  for (const [key, value] of objectEntries(paths)) {
    normalized[normalize(key)] = value;
  }

  return normalized;
}
