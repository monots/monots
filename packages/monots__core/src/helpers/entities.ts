import path from 'node:path';
import normalizePath from 'normalize-path';

import { FIELD_EXTENSIONS, NAME } from '../constants.js';
import type { EntrypointField } from '../structs.js';

interface GenerateFieldProps {
  /**
   * The absolute path to the dist folder.
   */
  dist: string;

  /**
   * The absolute path to the current directory
   */
  directory: string;

  /**
   * The absolute path to the source file.
   */
  source: string;

  /**
   * The type of field being generated.
   */
  type: EntrypointField;
}

/**
 * Generate the field value for the provided field.
 */
export function generateField(props: GenerateFieldProps): string {
  const { directory, dist, source, type } = props;

  return prefixRelativePath(
    normalizePath(
      path.join(
        path.relative(directory, dist),
        path.basename(source).replace(/.tsx?$/, FIELD_EXTENSIONS[type]),
      ),
    ),
  );
}

/**
 * Add a `./` prefix to a path that needs to be seen as relative.
 */
export function prefixRelativePath(path: string): string {
  return path.startsWith('.') ? path : `./${path}`;
}

/**
 * Create the TypeScript definition file which has been created.
 */
export function createTypeScriptContent(hasDefaultExport: boolean, relativePath: string) {
  const escapedPath = JSON.stringify(relativePath);

  return `export * from ${escapedPath};${
    hasDefaultExport ? `\nexport { default } from ${escapedPath};` : ''
  }\n`;
}

/**
 * Add flag to indicate that this file is auto generated.
 */
export function createAutoGeneratedFlag(folderName: string): object {
  return {
    __AUTO_GENERATED__: [
      `To update the configuration edit the following field in the 'package.json' for this package.`,
      `\`monots.tsconfigs.${folderName}\``,
      '',
      `Then run the command to automatically update everything: \`${NAME} fix\``,
    ],
  };
}
