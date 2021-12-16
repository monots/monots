import type { Infer, Struct } from 'superstruct';

export type StructSpread<Type> = Type extends Type ? Struct<Type, null> : never;
export type AnyStruct = Struct<any, any>;
export type AnyStructConstructor = new (...args: any) => AnyStruct;
export type AnyFunction<Arguments extends any[] = any[], Returns = any> = (
  ...args: Arguments
) => Returns;

/**
 * Infer the tuple types from a tuple of `Struct`s.
 */
export type InferStructTuple<
  Rest extends Array<Struct<any, any>>,
  Length extends number = Rest['length'],
> = Length extends Length ? (number extends Length ? Rest : _InferTuple<Rest, Length, []>) : never;
type _InferTuple<
  Rest extends Array<Struct<any, any>>,
  Length extends number,
  Accumulated extends unknown[],
  Index extends number = Accumulated['length'],
> = Index extends Length
  ? Accumulated
  : _InferTuple<Rest, Length, [...Accumulated, Infer<Rest[Index]>]>;

export interface Annotation<Name extends string> {
  __annotation__: Name;
}

/**
 * Support named annotations of primitive types.
 */
export type Annotate<Type, Name extends string> = Type & Partial<Annotation<Name>>;

export type Email = Annotate<string, 'Email'>;
export type Uuid = Annotate<string, 'Uuid'>;
