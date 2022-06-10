import type {
  BaseReporterLogProps,
  Log,
  LoggerMethod,
  LoggerMethodProps,
  MaybePromise,
  WriteStream,
} from './types.js';
import {
  type LoggerMethods,
  type LoggerProps,
  type LogLevelSettings,
  type Reporter,
  LogLevel,
} from './types.js';
import { getLogLevel } from './utils/get-log-level.js';
import { isLoggerMethodProps } from './utils/is-logger-method-props.js';

type QueueItem = [
  context: Logger,
  defaults: LoggerMethodProps,
  args: readonly [message: unknown, ...args: unknown[]],
  raw: boolean,
];

export class Logger {
  static #queue: QueueItem[] = [];
  static #paused = false;

  #reporters: Reporter[];
  #levels: LogLevelSettings;
  #level: number;
  #defaults: LoggerMethodProps;
  #stdout: WriteStream | undefined;
  #stderr: WriteStream | undefined;
  #throttle: number;
  #throttleThreshold: number;
  #async: boolean;
  #lastLogSerialized: string | undefined;
  #lastLog: BaseReporterLogProps | undefined;
  #lastLogTime: Date | undefined;
  #lastLogCount: number;
  #throttleTimeout: number | NodeJS.Timeout | undefined;

  get level(): number {
    return this.#level;
  }

  set level(level: LogLevel) {
    this.#level = getLogLevel({ level, levels: this.#levels });
  }

  get stdout() {
    return this.#stdout ?? console._stdout;
  }

  get stderr() {
    return this.#stderr ?? console._stderr;
  }

  constructor(props: LoggerProps = {}) {
    this.#reporters = props.reporters ?? [];
    this.#levels = props.levels ?? LEVELS;
    this.#level = getLogLevel({ level: props.level, levels: this.#levels });
    this.#defaults = props.defaults ?? {};
    this.#stdout = props.stdout;
    this.#stderr = props.stderr;
    this.#throttle = props.throttle ?? 1000;
    this.#throttleThreshold = props.throttleThreshold ?? 5;
    this.#async = props.async ?? false;

    // create logger methods
    for (const [method, settings] of Object.entries(this.#levels)) {
      const defaults: LoggerMethodProps = {
        method: method as LoggerMethod,
        ...settings,
        ...this.#defaults,
      };
      this[method as LoggerMethod] = this.#logFactory(defaults, false);
    }

    // Keep serialized version of last log
    this.#lastLogSerialized = undefined;
    this.#lastLog = undefined;
    this.#lastLogTime = undefined;
    this.#lastLogCount = 0;
    this.#throttleTimeout = undefined;
  }

  /**
   * Create a new logger from the current instance.
   */
  create(props: LoggerProps = {}) {
    return new Logger({
      reporters: this.#reporters,
      levels: this.#levels,
      level: this.#level,
      defaults: this.#defaults,
      stdout: this.#stdout,
      stderr: this.#stderr,
      throttle: this.#throttle,
      async: this.#async,
      throttleThreshold: this.#throttleThreshold,
      ...props,
    });
  }

  /**
   * Create a new logger with the provided defaults applied to each logging
   * method.
   */
  defaults(defaults: LoggerMethodProps) {
    return this.create({ defaults: { ...this.#defaults, ...defaults } });
  }

  /**
   * Create a `Logger` with the provided namespace.
   */
  namespace(namespace: string) {
    namespace = this.#defaults.namespace ? `${this.#defaults.namespace}:${namespace}` : namespace;
    return this.defaults({ namespace });
  }

  /**
   * Set the reporters for the `Logger`.
   */
  reporters(reporters: Reporter | Reporter[]): this {
    this.#reporters = Array.isArray(reporters) ? reporters : [reporters];
    return this;
  }

  pause() {
    Logger.#paused = true;
  }

  resume() {
    Logger.#paused = false;
    const queue = [...Logger.#queue];
    Logger.#queue = [];

    for (const [item, defaults, args, raw] of queue) {
      item.#log({ defaults, args, raw });
    }
  }

  #logFactory(defaults: LoggerMethodProps, raw: boolean): Log {
    return (message: unknown, ...args: unknown[]): MaybePromise<boolean> => {
      if (Logger.#paused) {
        Logger.#queue.push([this, defaults, [message, ...args], raw]);
        return true;
      }

      return this.#log({ defaults, args: [message, ...args], raw });
    };
  }

  #log(props: LogProps): MaybePromise<boolean> {
    // No logging if the level is too lower
    if (getLogLevel({ level: props.defaults.level }) > this.level) {
      return this.#async ? Promise.resolve(false) : false;
    }

    const logProps = {
      ...props.defaults,
      date: new Date(),
      args: [...props.args] as const,
    } as BaseReporterLogProps;
    const firstArg = props.args[0];

    if (props.raw && props.args.length === 1 && isLoggerMethodProps(firstArg)) {
      Object.assign(logProps, firstArg);
    }

    // lowercase the namespace
    logProps.namespace = logProps.namespace?.toLowerCase() ?? '';

    const resolveLog = (newLog = false) => {
      const repeated = this.#lastLogCount - this.#throttleThreshold;

      if (this.#lastLog && repeated > 0) {
        const extra = repeated > 1 ? [`(repeated ${repeated} times)`] : [];
        const args = [...this.#lastLog.args, ...extra] as const;

        this.#logSync({ ...this.#lastLog, args });
        this.#lastLogCount = 1;
      }

      if (newLog) {
        this.#lastLog = logProps;

        if (this.#async) {
          this.#logAsync(logProps);
        }

        this.#logSync(logProps);
      }
    };

    // Handle throttling

    clearTimeout(this.#throttleTimeout);
    const timeDifference = this.#lastLogTime
      ? logProps.date.getTime() - this.#lastLogTime.getTime()
      : 0;
    this.#lastLogTime = logProps.date;

    if (timeDifference < this.#throttle) {
      try {
        const serializedLog = JSON.stringify([logProps.method, logProps.namespace, logProps.args]);
        const isSameLog = this.#lastLogSerialized === serializedLog;
        this.#lastLogSerialized = serializedLog;

        if (isSameLog) {
          this.#lastLogCount++;

          if (this.#lastLogCount > this.#throttleThreshold) {
            // Auto-resolve when throttle is timed out
            this.#throttleTimeout = setTimeout(resolveLog, this.#throttle);
            return true;
          }
        }
      } catch {
        // ignore circular references
      }
    }

    resolveLog(true);
    return true;
  }

  #logSync(props: BaseReporterLogProps) {
    const extra = { async: false, stderr: this.stderr, stdout: this.stdout };

    for (const reporter of this.#reporters) {
      reporter.log({ ...props, ...extra });
    }
  }

  async #logAsync(props: BaseReporterLogProps) {
    const promises: Array<MaybePromise<void>> = [];
    const extra = { async: false, stderr: this.stderr, stdout: this.stdout };

    for (const reporter of this.#reporters) {
      promises.push(reporter.log({ ...props, ...extra }));
    }

    await Promise.all(promises);
  }
}

interface LogProps {
  defaults: LoggerMethodProps;
  args: readonly [message: unknown, ...args: unknown[]];
  raw: boolean;
}
export interface Logger extends LoggerMethods {}

export const LEVELS: LogLevelSettings = {
  silent: { level: LogLevel.silent },
  fatal: { level: LogLevel.fatal },
  error: { level: LogLevel.error },
  warn: { level: LogLevel.warn },
  log: { level: LogLevel.log },
  info: { level: LogLevel.info },
  success: { level: LogLevel.success },
  debug: { level: LogLevel.debug },
  trace: { level: LogLevel.trace },
  verbose: { level: LogLevel.verbose },
};

declare global {
  interface Console {
    _stdout: WriteStream;
    _stderr: WriteStream;
  }
}
