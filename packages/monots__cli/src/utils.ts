/* eslint-disable unicorn/prefer-module */
import path from 'node:path';

let DIRNAME: string;

try {
  DIRNAME = path.dirname(new URL(import.meta.url).pathname);
} catch (error) {
  if (typeof __dirname === 'string') {
    DIRNAME = __dirname;
  } else {
    throw error;
  }
}

export { DIRNAME };

/**
 * Get the absolute path within this package.
 */
export function getPackagePath(...paths: string[]) {
  console.log({ DIRNAME });
  return path.join(DIRNAME, '..', ...paths);
}
