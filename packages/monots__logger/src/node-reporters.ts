import formatDate from '@bitty/format-date';
import { isError, isPromise } from 'is-what';
import fs from 'node:fs';
import * as path from 'node:path';
import type { InspectOptions } from 'node:util';
import { formatWithOptions } from 'node:util';
import pc from 'picocolors';
import stringWidth from 'string-width';
import type { Except } from 'type-fest';

import type {
  AnsiForegroundColor,
  Maybe,
  MaybePromise,
  Reporter,
  ReporterLogProps,
  WriteStream,
} from './types.js';
import { getFormatter } from './utils/get-formatter.js';
import { getLogLevel } from './utils/get-log-level.js';
import { COLORS, SYMBOLS } from './utils/symbols.js';

interface SimpleReporterOptions extends InspectOptions {
  /**
   * The default secondary color to use for all log levels.
   */
  secondaryColor?: AnsiForegroundColor;

  /**
   * The format of the date. Set to false to disable formatting the date.
   *
   * @default 'HH:mm:ss'
   */
  date?: string | false;

  /**
   * The string to use for an indentation level.
   *
   * @default '  '
   */
  indentation?: string;
}

const SIMPLE_REPORTER_DEFAULTS: SimpleReporterOptions = {
  date: 'HH:mm:ss',
  colors: false,
  compact: true,
  indentation: '  ',
};

export class SimpleReporter implements Reporter {
  readonly options: SimpleReporterOptions;

  constructor(options: SimpleReporterOptions = {}) {
    this.options = { ...SIMPLE_REPORTER_DEFAULTS, ...options };
  }

  /**
   * Format an error stack
   */
  formatStack(stack: string): string {
    const { indentation } = this.options;
    const parsed = parseStack(stack).join(`\n${indentation}`);

    return `${indentation}${parsed}`;
  }

  formatArgs(args: readonly unknown[]): string {
    const transformed = args.map((argument) => {
      if (isError(argument) && argument.stack) {
        return `${argument.message}\n${this.formatStack(argument.stack)}`;
      }

      return argument;
    });

    return formatWithOptions(this.options, ...transformed);
  }

  formatDate(date: Date) {
    return this.options.date ? formatDate(date, this.options.date) : '';
  }

  formatProps(props: FormatReporterLogProps): string {
    const message = this.formatArgs(props.args);

    return filterAndJoin([bracket(props.method), bracket(props.namespace), message]);
  }

  log(props: ReporterLogProps): MaybePromise<void> {
    const { async, stdout, stderr, ...rest } = props;
    const line = this.formatProps({ ...rest, width: stdout.columns ?? 0 });
    const stream = getLogLevel({ level: props.level }) < 2 ? stderr : stdout;
    const type = async ? 'async' : 'default';
    const maybePromise = writeStream({ line, stream, type });

    if (isPromise(maybePromise)) {
      return maybePromise;
    }
  }
}

const PRETTY_REPORTER_DEFAULTS: SimpleReporterOptions = {
  secondaryColor: 'gray',
  ...SIMPLE_REPORTER_DEFAULTS,
};

export class PrettyReporter extends SimpleReporter {
  constructor(options: SimpleReporterOptions = {}) {
    super({ ...PRETTY_REPORTER_DEFAULTS, ...options });
  }

  formatMethod(props: FormatReporterLogProps): string {
    const prefix = SYMBOLS[props.method];

    let badge = '';

    if (props.badge) {
      const formatter = getFormatter({
        color: 'black',
        background: COLORS[props.method] ?? 'white',
        format: 'bold',
      });
      badge = ` ${formatter(props.method)}`;
    }

    return `${prefix}${badge}`;
  }

  override formatStack(stack: string): string {
    return `\n${parseStack(stack)
      .map((line) =>
        `${this.options.indentation}${line}`
          .replace(/^at +/, (match) => pc.gray(match))
          .replace(/\((.+)\)/, (_, capture) => `(${pc.cyan(capture)})`),
      )
      .join('\n')}`;
  }

  override formatProps(props: FormatReporterLogProps): string {
    const [message, ...additional] = this.formatArgs(props.args).split('\n');
    const badge = props.badge ?? getLogLevel({ level: props.level }) < 2;
    const formatter = getFormatter({ color: this.options.secondaryColor });
    const date = this.formatDate(props.date);
    const coloredDate = date ? formatter(date) : '';
    const method = this.formatMethod(props);
    const namespace = props.namespace ? formatter(props.namespace) : '';
    const formattedMessage = message?.replace(/`([^`]+)`/g, (_, m) => pc.cyan(m)) ?? '';
    const left = filterAndJoin([method, formattedMessage]);
    const right = filterAndJoin([namespace, coloredDate]);
    const space =
      props.width -
      stringWidth(left) -
      stringWidth(right) -
      (this.options.indentation?.length ?? 2);

    let line = '';

    line = space > 0 && props.width >= 80 ? `${left}${' '.repeat(space)}${right}` : left;

    line += additional.length > 0 ? `\n${additional.join('\n')}` : '';

    return badge ? `\n${line}\n` : line;
  }
}

interface FormatReporterLogProps extends Omit<ReporterLogProps, 'async' | 'stdout' | 'stderr'> {
  badge?: boolean;
  width: number;
}

/**
 * Parse the error stack.
 */
function parseStack(stack: string): string[] {
  const cwd = `${process.cwd()}${path.sep}`;
  return stack
    .split('\n')
    .splice(1)
    .map((line) => line.trim().replace('file://', '').replace(cwd, ''))
    .filter((line) => line.length > 0);
}

/**
 * Only display the items that are truthy.
 */
function filterAndJoin(items: string[]): string {
  return items.filter((item) => !!item).join(' ');
}

/**
 * Wrap the item in brackets.
 */
function bracket(item: Maybe<string>): string {
  return item ? `[${item}]` : '';
}

interface WriteStreamProps {
  line: string;
  /**
   * The nodejs stream to write to.
   */
  stream: WriteStream;
  /**
   * @default 'default'
   */
  type: 'async' | 'sync' | 'default';
}

function writeStream(props: WriteStreamProps) {
  const { line, stream, type } = props;

  switch (type) {
    case 'async':
      return new Promise<void>((resolve) => {
        if (stream.write(line) === true) {
          resolve();
        } else {
          stream.once('drain', () => resolve());
        }
      });

    case 'sync':
      return fs.writeSync(stream.fd, line);

    default:
      return stream.write(line);
  }
}
