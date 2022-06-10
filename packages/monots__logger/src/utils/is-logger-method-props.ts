import { isPlainObject } from 'is-what';

import type { LoggerMethodProps } from '../types.js';

export function isLoggerMethodProps(value: unknown): value is LoggerMethodProps {
  // Should be plain object
  if (!isPlainObject(value)) {
    return false;
  }

  // Should contains either 'message' or 'args' field
  if (!value.message && !value.args) {
    return false;
  }

  // Handle non-standard error objects
  if (value.stack) {
    return false;
  }

  return true;
}
