/* eslint-disable no-console */
import chalkTemplate from 'chalk-template';
import figures from 'figures';
import util from 'node:util';

const messageTypes = {
  error: chalkTemplate`{red ${figures.cross} - error}`,
  success: chalkTemplate`{green ${figures.tick} - success}`,
  info: chalkTemplate`{cyan ${figures.info} - info}`,
  none: '',
} as const;

export function format(
  arguments_: unknown[],
  options: { type: keyof typeof messageTypes; scope?: string },
): string {
  const { type, scope } = options;
  const scopeString = scope === undefined ? '' : chalkTemplate` {cyan ${scope}}`;
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
