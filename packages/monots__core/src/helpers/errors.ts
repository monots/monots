import is from '@sindresorhus/is';
import chalk from 'chalk';
import { BaseError } from 'make-error';
import util from 'node:util';
import * as t from 'superstruct';

import { format } from './logger';

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
  const { struct, level, name } = props;

  try {
    t.assert(value, struct);
  } catch (error) {
    if (!isStructError(error)) {
      throw error;
    }

    const errors: ConfigurationError[] = [];

    for (const failure of error.failures()) {
      const { key, message } = failure;
      errors.push(
        new ConfigurationError(
          chalk`${level} configuration error for ${key}: {italic ${message}}`,
          name,
        ),
      );
    }

    throw new BatchError(errors);
  }
}

function isStructError(value: unknown): value is t.StructError {
  return is.error(value) && is.function_((value as any).failures);
}
