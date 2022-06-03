import type { ValueOf } from 'type-fest';

/**
 * The named priority levels for sorting plugins. Higher numbers are higher priority and are loaded first.
 *
 * The default priority used by most internal plugins.
 *
 * @default MonotsPriority.Default
 */
export const MonotsPriority = {
  Lowest: 0,
  Low: 10,
  Default: 50,
  Medium: 100,
  High: 1000,
  Highest: 10_000,
} as const;
export type MonotsPriority = keyof typeof MonotsPriority;

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
export type LogLevel = keyof typeof LogLevel | ValueOf<typeof LogLevel>;
