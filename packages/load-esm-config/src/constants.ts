import createDebugger from 'debug';
import type { ValueOf } from 'type-fest';

export const DEFAULT_GET_ARGUMENT = () => {};
export const SUPPORTED_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
] as const;
export type SupportedExtensions = ValueOf<typeof SUPPORTED_EXTENSIONS, number>;
export const debug = createDebugger('monots:load-esm-config');
