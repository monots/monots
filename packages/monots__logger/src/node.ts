import { isCI, isDebug, isTest } from 'std-env';

import { Logger } from './logger.js';
import { PrettyReporter, SimpleReporter } from './node-reporters.js';
import { LogLevel } from './types.js';

const level = isDebug ? LogLevel.debug : isTest ? LogLevel.warn : LogLevel.info;

export const logger = new Logger({
  level,
  reporters: [isCI || isTest ? new SimpleReporter() : new PrettyReporter()],
});
