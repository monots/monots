import type { Except, ValueOf } from 'type-fest';

type NumberLiteral = number & Record<never, never>;

/**
 * The different log levels.
 */
export const LogLevel = {
  silent: Number.NEGATIVE_INFINITY as NumberLiteral,
  fatal: 0,
  error: 0,
  warn: 1,
  log: 2,
  info: 3,
  success: 3,
  debug: 4,
  trace: 5,
  verbose: Number.POSITIVE_INFINITY as NumberLiteral,
} as const;

/**
 * Log level as a primitive value.
 */
export type LogLevel = LogLevelKey | LogLevelValue;
export type LogLevelValue = ValueOf<typeof LogLevel>;

/**
 * The log level as a string.
 */
export type LogLevelKey = keyof typeof LogLevel;

export interface LoggerMethodProps extends Except<Partial<BaseReporterLogProps>, 'level'> {
  level?: LogLevel;
}

export type LogLevelSettings = { [level in LogLevelKey]: LoggerMethodProps };
export interface LoggerProps {
  reporters?: Reporter[];
  levels?: LogLevelSettings;
  level?: LogLevel;
  defaults?: LoggerMethodProps;
  stdout?: WriteStream;
  stderr?: WriteStream;

  /**
   * @default 1000
   */
  throttle?: number;

  /**
   * The number of logs required for the logger to throttle new logs.
   *
   * @default 5
   */
  throttleThreshold?: number;

  /**
   * @default false
   */
  async?: boolean;
}

/**
 * All custom loggers must implement these custom methods.
 */
export interface LoggerMethods {
  fatal: Log;
  error: Log;
  warn: Log;
  log: Log;
  info: Log;
  success: Log;
  debug: Log;
  trace: Log;
  verbose: Log;
}

export interface Log {
  (message: LoggerMethodProps, ...args: unknown[]): MaybePromise<boolean>;
  (message: unknown, ...args: unknown[]): MaybePromise<boolean>;
}

export type LoggerMethod = keyof LoggerMethods;

export interface BaseReporterLogProps {
  level: LogLevelValue;
  method: LoggerMethod;
  namespace: string;
  args: readonly [message: unknown, ...args: unknown[]];
  date: Date;
}

/**
 * The properties that are passed into the `Reporter`.
 */
export interface ReporterLogProps extends BaseReporterLogProps {
  async: boolean;
  stdout: WriteStream;
  stderr: WriteStream;
}

export interface WriteStream extends NodeJS.WriteStream {
  fd: 0 | 1 | 2;
}

export interface Reporter {
  log: (props: ReporterLogProps) => MaybePromise<void>;
}

export type Maybe<Type> = Type | null | undefined;
export type MaybePromise<Type> = Type | Promise<Type>;
export type AnsiForegroundColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray';
export type AnsiBackgroundColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white';
export type AnsiFormat =
  | 'reset'
  | 'bold'
  | 'dim'
  | 'italic'
  | 'underline'
  | 'inverse'
  | 'hidden'
  | 'strikethrough';
