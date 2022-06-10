import isUnicodeSupported from 'is-unicode-supported';
import pc from 'picocolors';

import type { AnsiBackgroundColor, LoggerMethod } from '../types.js';

const symbols: Record<LoggerMethod, string> = {
  fatal: pc.red('ⓧ'),
  error: pc.red('✖'),
  warn: pc.yellow('⚠'),
  log: '',
  info: pc.blue('ℹ'),
  success: pc.green('✔'),
  debug: pc.bold(pc.gray('›')),
  trace: pc.gray('›'),
  verbose: pc.white('›'),
};
const fallback: Record<LoggerMethod, string> = {
  fatal: pc.red('(×)'),
  error: pc.red('×'),
  warn: pc.yellow('‼'),
  log: '',
  info: pc.blue('i'),
  success: pc.green('√'),
  debug: pc.bold(pc.gray('›')),
  trace: pc.dim(pc.gray('›')),
  verbose: pc.dim(pc.white('›')),
};

export const COLORS: Partial<Record<LoggerMethod, AnsiBackgroundColor>> = {
  fatal: 'red',
  error: 'red',
  warn: 'yellow',
  log: 'white',
  info: 'cyan',
  success: 'green',
};

export const SYMBOLS = isUnicodeSupported() ? symbols : fallback;
