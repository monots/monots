import emailValidator from 'email-validator';
import isUuid from 'is-uuid';
import {
  define,
  func,
  Infer,
  instance,
  refine,
  string,
  Struct,
  StructError,
  tuple,
} from 'superstruct';
import { ObjectSchema } from 'superstruct/lib/utils';

import { FunctionStruct } from './function-struct.js';
import { PromiseStruct } from './promise-struct.js';
import {
  AnyStruct,
  AnyStructConstructor,
  Email,
  InferStructTuple,
  StructSpread,
  Uuid,
} from './types.js';

/**
 * Ensure that a value is a bigint.
 */
export function bigint(): Struct<bigint, null> {
  return define('bigint', (value) => {
    return typeof value === 'bigint';
  });
}

/**
 * Create args which can be used with `fn`. This is wrapper around the builtin
 * `tuple` struct with some added features.
 *
 * ### Examples
 *
 * ```js
 * import * as s from from 'superstruct-extra';
 *
 * const schema = args(s.string(), s.number());
 *
 * function test(...args) {
 *   schema.validate(args); // Will throw if args are invalid.
 *   console.log(...args)
 * }
 *
 * test('a', 1) // `a 1`
 * test(1, 'a') // => threw `StructError`
 * ```
 */
export function args(): Struct<[], null>;
export function args<Arg1 extends Struct<any>, Rest extends Array<Struct<any>>>(
  arg1: Arg1,
  ...rest: Rest
): Struct<[Infer<Arg1>, ...InferStructTuple<Rest>], null>;
export function args(...args: Array<Struct<any>>): Struct<any, null> {
  if (Array.isArray(args) && args.length > 1) {
    return tuple(args as [Struct<any>]);
  }

  return define<[]>('noArgs', (value) => Array.isArray(value) && value.length === 0);
}

const fnArgs = args(instance<AnyStructConstructor>(Struct), instance<AnyStructConstructor>(Struct));

/**
 * Create a typed function with validated arguments and a validated return type.
 *
 * ### Examples
 *
 * ```ts
 * import * as s from 'superstruct-extra';
 *
 * const fnSchema = s.fn(
 *   'myFunction',
 *   // Set the arguments
 *   s.args(s.string(), s.number()),
 *   // Set the return type to `void`
 *   s.nullish('void')
 * );
 *
 * const myFunction: s.Infer<typeof fnSchema> = (s, n) => {
 *   console.log(s, n);
 * };
 *
 * fnSchema.call(myFunction, 'a', 1) // => `a 1`
 * fnSchema.call(myFunction, 1, 'a') // => throws `StructError`
 * ```
 */
export function fn(): Struct<Function, null>;
export function fn<Arguments extends any[], Returns, ArgumentsStruct = any, ReturnsStruct = any>(
  args: Struct<Arguments, ArgumentsStruct>,
  returns: Struct<Returns, ReturnsStruct>,
): FunctionStruct<Arguments, Returns, ArgumentsStruct, ReturnsStruct>;
export function fn<Arguments extends any[], Returns, ArgumentsStruct = any, ReturnsStruct = any>(
  args: Struct<Arguments, ArgumentsStruct>,
  returns: Struct<Returns, ReturnsStruct>,
): FunctionStruct<Arguments, Returns, ArgumentsStruct, ReturnsStruct>;
export function fn(...rest: any[]): any {
  if (fnArgs.is(rest)) {
    const [args, returns] = rest;
    return new FunctionStruct({ args, returns });
  }

  return func();
}

/**
 * Create a promise.
 *
 * ### Examples
 *
 * ```ts
 * import * as s from 'superstruct-extra';
 *
 * const voidPromiseSchema = s.promise();
 * const stringPromiseSchema = s.promise(s.string());
 *
 * const validPromise = Promise.resolve('Hello World');
 * await stringPromiseSchema.promise(validPromise); // => `Hello World`
 *
 * const invalidPromise = Promise.resolve(1);
 * await stringPromiseSchema.promise(invalidPromise) // => throw `StructError`
 * ```
 */
export function promise(): Struct<Promise<void>, null>;
export function promise<Value, ValueStruct = any>(
  value: Struct<Value, ValueStruct>,
): Struct<Promise<Value>, null>;
export function promise(value?: AnyStruct): Struct<Promise<any>, null> {
  return value ? new PromiseStruct({ value }) : new PromiseStruct({ value: nullish('void') });
}

type NullishName = 'null' | 'undefined' | 'void';

/**
 * Create a type for `null`, `undefined` or `void`.
 *
 * This is primarily used because these are protected words in JavaScript.
 *
 * ### Examples
 *
 * ```tsx
 * import * as s from 'superstruct-extra';
 *
 * s.nullish() // => `null | undefined`
 * s.nullish('undefined') // => `undefined`
 * s.nullish('void') // => `void`
 * s.nullish('null') // => `null`
 * ```
 */
export function nullish(): Struct<null | undefined, null>;
export function nullish(type: 'null'): Struct<null, null>;
export function nullish(type: 'undefined'): Struct<undefined, null>;
export function nullish(type: 'void'): Struct<void, null>;
export function nullish(
  type: NullishName = 'null',
): StructSpread<null | undefined | void> | Struct<null | undefined> {
  if (type === 'null') {
    return define<null>('null', (value) => value === null);
  }

  if (type === 'undefined') {
    return define<undefined>('undefined', (value) => value === undefined);
  }

  if (type === 'void') {
    return define<void>('void', (value) => value === undefined);
  }

  return define<null | undefined>('nullish', (value) => value == null);
}

/**
 * Predicate check for struct error.
 */
export function isStructError(value: unknown): value is StructError {
  return typeof value === 'object' && value instanceof StructError;
}

/**
 * Validate this as a `uuid` string.
 *
 * @param [version='v4'] The version to use defaults to `v4`.
 *
 * ### Examples
 *
 * ```ts
 * import * as s from 'superstruct-extra';
 *
 * const uuidSchema = se.uuid();
 * uuidSchema.is('f9d24717-fa54-447e-aa1d-f1163741210f') // => true;
 * uuidSchema.is('123') // => false
 * ```
 */
export function uuid(version: keyof typeof isUuid = 'v4'): Struct<Uuid, null> {
  return refine<Uuid, null>(string(), `uuid:${version}`, (value) => isUuid[version](value));
}

/**
 * Create a struct for validating emails.
 *
 * ### Examples
 *
 * ```ts
 * import * as se from 'superstruct-extra';
 *
 * const emailSchema = se.email();
 * emailSchema.is('test@email.com') // => true;
 * emailSchema.is('112@') // => false
 * ```
 */
export function email(): Struct<Email, null> {
  return refine<Email, null>(string(), 'email', (value) => emailValidator.validate(value));
}

/**
 * Ensure that a string, array, map, or set is not empty.
 */
export function nonempty<Type extends Map<any, any> | Set<any> | any[], ChildStruct>(
  struct: Struct<Type, ChildStruct>,
): Struct<Type, ChildStruct> {
  const expected = `Expected a nonempty ${struct.type}`;

  return refine(struct, 'nonempty', (value) => {
    if (Array.isArray(value)) {
      const { length } = value;
      return length > 0 || `${expected} but received one with a length of \`${length}\``;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const { size } = value as Set<any> | Map<any, any>;
    return size > 0 || `${expected} but received one with a size of \`${size}\``;
  });
}

/**
 * Refine the type of arrays, maps, sets, and objects to be readonly.
 */
export function readonly<Iterable extends any[], ChildStruct>(
  struct: Struct<Iterable, ChildStruct>,
): Struct<readonly [...Iterable], ChildStruct>;
export function readonly<Key, Value, ChildStruct>(
  struct: Struct<Map<Key, Value>, ChildStruct>,
): Struct<ReadonlyMap<Key, Value>, ChildStruct>;
export function readonly<Value, ChildStruct>(
  struct: Struct<Set<Value>, ChildStruct>,
): Struct<ReadonlySet<Value>, ChildStruct>;
export function readonly<Shape extends Record<string, unknown>, ChildStruct extends ObjectSchema>(
  struct: Struct<Shape, ChildStruct>,
): Struct<Readonly<Shape>, Readonly<ChildStruct>>;
export function readonly(struct: AnyStruct): AnyStruct {
  return refine(struct, `readonly:${struct.type}`, (value) => value);
}
