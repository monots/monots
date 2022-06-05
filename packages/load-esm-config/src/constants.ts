import type { Consola } from 'consola';
import * as path from 'node:path';
import type { ValueOf } from 'type-fest';

interface GetPatternProps {
  name: string;
  extension: string;
  directory: string;
}

export const DEFAULT_GET_ARGUMENT = () => {};
export const DEFAULT_GET_PATTERN = (props: GetPatternProps) => [
  path.join(props.directory, `${props.name}.config${props.extension}`),
];
export type GetPattern = typeof DEFAULT_GET_PATTERN;
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
