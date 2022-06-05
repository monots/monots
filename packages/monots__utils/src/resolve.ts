import { resolve as baseResolve, moduleResolve } from 'import-meta-resolve';

/**
 * ```
 * import { resolve } from '@monots/utils';
 *
 * const url = await resolve('package-name', import.meta.url);
 * ```
 */
export async function resolveUrl(id: string, fileUrl: string): Promise<URL> {
  return new URL(await baseResolve(id, fileUrl));
  // return moduleResolve(id, new URL(fileUrl), new Set(['node', 'import']), false).href;
}

/**
 * Get's the absolute file path of the current file.
 *
 * ```
 * import { resolvePath } from '@monots/utils';
 *
 * const filePath = await resolvePath(import.meta.url);
 * ```
 */
export async function resolvePath(id: string, fileUrl: string): Promise<string> {
  return new URL(await resolveUrl(id, fileUrl)).pathname;
}

export { resolve } from 'import-meta-resolve';
