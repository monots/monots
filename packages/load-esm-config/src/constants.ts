import type { ValueOf } from 'type-fest';
import type { Consola } from 'consola';

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

/**
 * The different log levels based on `consola`
 */
export const LogLevel = {
  /**
   * No logs.
   */
  silent: Number.NEGATIVE_INFINITY,
  fatal: 0,
  error: 0,
  warn: 1,
  log: 2,
  info: 3,
  success: 3,
  debug: 4,
  trace: 5,
  verbose: Number.POSITIVE_INFINITY,
} as const;

export type LogLevel = keyof typeof LogLevel | ValueOf<typeof LogLevel> | Consola;
