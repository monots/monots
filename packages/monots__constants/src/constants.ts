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
