/* eslint-disable no-console */
import chalk from 'chalk';
import figures from 'figures';
import util from 'node:util';

const messageTypes = {
  error: chalk`{red ${figures.cross} - error}`,
  success: chalk`{green ${figures.tick} - success}`,
  info: chalk`{cyan ${figures.info} - info}`,
  none: '',
} as const;

export function format(
  arguments_: unknown[],
  options: { type: keyof typeof messageTypes; scope?: string },
): string {
  const { type, scope } = options;
  const scopeString = scope === undefined ? '' : chalk` {cyan ${scope}}`;
  const fullPrefix = `\n🧐 ${messageTypes[type]}${scopeString}\n`;

  return fullPrefix + util.format('', ...arguments_);
}
export function error(message: string, scope?: string): void {
  console.error(format([message], { type: 'error', scope }));
}

export function success(message: string, scope?: string): void {
  console.log(format([message], { type: 'success', scope }));
}

export function info(message: string, scope?: string): void {
  console.log(format([message], { type: 'info', scope }));
}

export function log(message: string): void {
  console.log(format([message], { type: 'none' }));
}
