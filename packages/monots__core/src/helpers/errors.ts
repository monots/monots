import { BaseError } from 'make-error';
import * as util from 'node:util';
import * as t from 'superstruct';

import { format } from './logger.js';

export class FatalError extends BaseError {
  scope: string;

  constructor(message: string, scope: string) {
    super(message);
    this.scope = scope;
  }
}

export class BatchError extends BaseError {
  errors: FatalError[];

  constructor(errors: FatalError[]) {
    super(
      errors
        .map((error) => {
          return format([error.message], { type: 'none', scope: error.scope });
        })
        .join('\n'),
    );

    this.errors = errors;
  }
}

export class ScopelessError extends BaseError {}

export class UnexpectedBuildError extends FatalError {
  constructor(error: Error, pkgName: string) {
    super(`${util.format('', error).trim()}`, pkgName);
  }
}

export class FixableError extends FatalError {}

export class ConfigurationError extends FatalError {}

interface AssertProps<Type, Struct> {
  struct: t.Struct<Type, Struct>;
  level: 'package' | 'entrypoint' | 'project';
  name: string;
}
export function assert<Type, Struct>(
  value: unknown,
  props: AssertProps<Type, Struct>,
): asserts value is Type {
  const { struct } = props;
  const [error] = t.validate(value, struct);

  if (error) {
    throw error;
  }
}
