import { type LogLevelSettings, type LogLevelValue, type Maybe, LogLevel } from '../types.js';

/**
 * Get the log level as a number.
 */
export function getLogLevel(props: GetLogLevelProps): LogLevelValue {
  const { level, fallback = 3, levels = {} } = props;

  if (level == null) {
    return fallback;
  }

  if (typeof level === 'number') {
    return level;
  }

  const method = levels[level];

  if (method?.level != null) {
    return typeof method.level === 'number' ? method.level : LogLevel[method.level];
  }

  return fallback;
}

interface GetLogLevelProps {
  level: Maybe<LogLevel>;
  levels?: Partial<LogLevelSettings>;
  fallback?: number;
}
