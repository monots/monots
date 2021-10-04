import isPromise from 'is-promise';
import { Struct } from 'superstruct';

/**
 * A custom Struct for validating function calls at runtime.
 */
export class PromiseStruct<Value, ValueStruct = any> extends Struct<Promise<Value>, null> {
  readonly value: Struct<Value, ValueStruct>;

  constructor(props: PromiseStructProps<Value, ValueStruct>) {
    const { value } = props;

    super({ type: 'function', schema: null, validator: (value) => isPromise(value) });

    this.value = value;
  }

  /**
   * Asynchronously validates the promise value.
   */
  async promise(promise: unknown): Promise<Value> {
    this.assert(promise);
    return this.value.create(await promise);
  }
}

export interface PromiseStructProps<Value, ValueStruct = any> {
  value: Struct<Value, ValueStruct>;

  /**
   * Whether this should be a strict promise or not.
   */
  strict?: boolean;
}

/**
 * Returns true when the struct is a [PromiseStruct]
 */
export function isPromiseStruct<Value, ValueStruct = any>(
  value: unknown,
): value is PromiseStruct<Value, ValueStruct> {
  return typeof value === 'object' && value instanceof PromiseStruct;
}
