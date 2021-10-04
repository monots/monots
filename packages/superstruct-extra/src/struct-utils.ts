import { Struct } from 'superstruct';

/**
 * Predicate check which determines whether a value is a struct.
 *
 * @param value The value to test
 */
export function isStruct<Type = any, Schema = any>(value: unknown): value is Struct<Type, Schema> {
  return typeof value === 'object' && value instanceof Struct;
}
