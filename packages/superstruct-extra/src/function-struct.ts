import { func, Struct } from 'superstruct';

import type { AnyFunction } from './types.js';

/**
 * A custom Struct for validating function calls at runtime.
 */
export class FunctionStruct<
  Arguments extends any[],
  Returns,
  ArgumentsStruct = any,
  ReturnsStruct = any,
> extends Struct<AnyFunction<Arguments, Returns>> {
  readonly args: Struct<Arguments, ArgumentsStruct>;
  readonly returns: Struct<Returns, ReturnsStruct>;

  constructor(props: FunctionStructProps<Arguments, Returns, ArgumentsStruct, ReturnsStruct>) {
    const { args, returns } = props;

    super({ type: 'function', schema: null, validator: functionValidator });

    this.args = args;
    this.returns = returns;
  }

  /**
   * Implement a fully validated function.
   *
   * The value returned will be a fully typed function with is validated at
   * runtime. If the arguments provided or the return type is invalid an error
   * will be thrown.
   *
   * ### Examples
   *
   * ```ts
   * import * as s from 'superstruct-extra';
   *
   * const myFunctionSchema = s.fn(
   *   'myFunction',
   *   // Set the arguments
   *   s.args(s.string(), s.number()),
   *   // Set the return type to `void`
   *   s.nullish('void')
   * );
   *
   * const myFunction = myFunctionSchema.implement((s, n) => {
   *   console.log(s, n);
   * });
   *
   * myFunction('a', 1) // => `a 1`
   * myFunction(1, 'a') // => throws `StructError`
   * ```
   */
  implement(fn: AnyFunction<Arguments, Returns>): AnyFunction<Arguments, Returns> {
    return this.createWrappedFunction(fn);
  }

  /**
   * Call a function with arguments and return value validation at runtime.
   *
   * ### Examples
    ```ts
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
  call(fn: AnyFunction<Arguments, Returns>, ...args: Arguments): Returns {
    return this.createWrappedFunction(fn)(...args);
  }

  private createWrappedFunction(fn: AnyFunction<Arguments, Returns>) {
    const wrappedFn = (...args: Arguments): Returns => {
      return this.returns.create(fn(...this.args.create(args)));
    };

    wrappedFn.name = fn.name;
    return wrappedFn;
  }
}

const { validator: functionValidator } = func();

export interface FunctionStructProps<
  Arguments extends any[],
  Returns,
  ArgumentsStruct = any,
  ReturnsStruct = any,
> {
  args: Struct<Arguments, ArgumentsStruct>;
  returns: Struct<Returns, ReturnsStruct>;
}

/**
 * Returns true when the struct is a [FunctionStruct]
 */
export function isFunctionStruct<
  Arguments extends any[] = any[],
  Returns = any,
  ArgumentsStruct = any,
  ReturnsStruct = any,
>(value: unknown): value is FunctionStruct<Arguments, Returns, ArgumentsStruct, ReturnsStruct> {
  return typeof value === 'object' && value instanceof FunctionStruct;
}
