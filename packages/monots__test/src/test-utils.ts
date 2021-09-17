import is from '@sindresorhus/is';

import { Implementation, ImplementationFn, Macro } from './types/index.js';

export interface TestTitle {
  raw: string | undefined;
  value: string;
  isSet: boolean;
  isValid: boolean;
  isEmpty: boolean;
}

function buildTitle<Args extends unknown[], Context = unknown>(
  raw: string | undefined,
  implementation: Implementation<Args, Context> | undefined,
  args: Args,
): TestTitle {
  let value = isMacro(implementation) ? implementation.title?.(raw, ...args) ?? raw : raw;
  let isValid = false;

  if (is.string(value)) {
    isValid = true;
    value = value.trim().replace(/\s+/g, ' ');
  }

  return {
    raw,
    value: value ?? '',
    isSet: value !== undefined,
    isValid,
    isEmpty: !isValid || value === '',
  };
}

export interface ParsedTestArgs<Args extends unknown[], Context = unknown> {
  args: Args;
  testMethod?: ImplementationFn<Args, Context>;
  title: TestTitle;
}

export function parseTestArgs<Args extends unknown[], Context = unknown>(
  macro: Macro<Args, Context>,
  ...args: Args
): ParsedTestArgs<Args, Context>;
export function parseTestArgs<Args extends unknown[], Context = unknown>(
  title: string,
  testMethod: Implementation<Args, Context>,
  ...args: Args
): ParsedTestArgs<Args, Context>;
export function parseTestArgs<Args extends unknown[], Context = unknown>(
  titleOrMacro: string | Macro<Args, Context>,
  testMethodOrArgs: Implementation<Args, Context> | undefined,
  ...args: Args
): ParsedTestArgs<Args, Context> {
  let title: string | undefined;
  let testMethod: Implementation<Args, Context> | undefined;

  if (isMacro<Args, Context>(titleOrMacro)) {
    testMethod = titleOrMacro;
    args.unshift(testMethodOrArgs);
  } else {
    title = titleOrMacro;
    testMethod = testMethodOrArgs;
  }

  return {
    args,
    testMethod: isMacro<Args, Context>(testMethod) ? testMethod.exec : testMethod,
    title: buildTitle(title, testMethod, args),
  };
}

export function isMacro<Args extends unknown[] = unknown[], Context = unknown>(
  value: unknown,
): value is Macro<Args, Context> {
  return is.plainObject(value) && is.function_(value.title) && is.function_(value.exec);
}

export function isLikeSelector(selector) {
  return (
    selector !== null &&
    typeof selector === 'object' &&
    Reflect.getPrototypeOf(selector) === Object.prototype &&
    Reflect.ownKeys(selector).length > 0
  );
}

export const CIRCULAR_SELECTOR = new Error('Encountered a circular selector');

export function selectComparable(lhs, selector, circular = new Set()) {
  if (circular.has(selector)) {
    throw CIRCULAR_SELECTOR;
  }

  circular.add(selector);

  if (lhs === null || typeof lhs !== 'object') {
    return lhs;
  }

  const comparable = {};

  for (const [key, rhs] of Object.entries(selector)) {
    if (isLikeSelector(rhs)) {
      comparable[key] = selectComparable(Reflect.get(lhs, key), rhs, circular);
    } else {
      comparable[key] = Reflect.get(lhs, key);
    }
  }

  return comparable;
}
