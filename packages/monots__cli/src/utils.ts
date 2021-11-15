import path from 'node:path';

export const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Get the absolute path within this package.
 */
export function getPackagePath(...paths: string[]) {
  return path.join(__dirname, '..', ...paths);
}
