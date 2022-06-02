import is from '@sindresorhus/is';
import type { ReadonlyDeep } from 'type-fest';

type AnyFunction = (...args: any[]) => any;

export type MaybePromise<T> = T | Promise<T>;

export interface EventsMap {
  [event: string]: AnyFunction;
}

type Listeners<Events extends EventsMap> = Partial<{
  [EventName in keyof Events]: Array<Events[EventName]>;
}>;

export type Unsubscribe = () => void;

interface BaseEmitProps<Events extends EventsMap, EventName extends keyof Events, Return> {
  /**
   * The name of the event being emitted.
   */
  event: EventName;

  /**
   * The arguments that will be passed through to the event handlers.
   */
  args: Parameters<Events[EventName]>;

  /**
   * Transforms all the return values of the listeners into one final value.
   *
   * When no transformer is provided the return type will be `void`.
   */
  transformer?: (values: Array<Awaited<ReturnType<Events[EventName]>>>) => Return;

  /**
   * When to stop running through the listeners.
   */
  stopAt?: (value: ReturnType<Events[EventName]>, index: number) => boolean;
}

interface SyncEmitProps<Events extends EventsMap, EventName extends keyof Events, Return>
  extends BaseEmitProps<Events, EventName, Return> {
  async?: false;
}

interface AsyncEmitProps<Events extends EventsMap, EventName extends keyof Events, Return>
  extends BaseEmitProps<Events, EventName, Return> {
  /**
   * Set to `true` to emit the event asynchronously.
   */
  async: true;

  /**
   * Whether to iterate over the promises in parallel or sequentially.
   *
   * @default false
   */
  parallel?: boolean;
}

interface Emit<Events extends EventsMap> {
  <EventName extends keyof Events, Return = void>(
    props: SyncEmitProps<Events, EventName, Return>,
  ): Return;
  <EventName extends keyof Events, Return>(
    props: AsyncEmitProps<Events, EventName, Return>,
  ): Promise<Awaited<Return>>;
}

export class Emitter<Events extends EventsMap = EventsMap> {
  #events: Listeners<Events> = {};

  /**
   * Event names in keys and arrays with listeners in values.
   */
  get events(): ReadonlyDeep<Listeners<Events>> {
    return this.#events as ReadonlyDeep<Listeners<Events>>;
  }

  /**
   * Add a listener for a given event.
   *
   * ```js
   * const unbind = ee.on('tick', (tickType, tickDuration) => {
   *   count += 1
   * })
   *
   * disable () {
   *   unbind()
   * }
   * ```
   *
   * @param event The event name.
   * @param handler The listener function.
   * @returns Unbind listener from event.
   */
  on = <Key extends keyof Events>(event: Key, handler: Events[Key]): Unsubscribe => {
    this.#events[event] = this.#events[event] || [];
    this.#events[event]?.push(handler);

    return () => {
      this.#events[event] = (this.#events[event] ?? []).filter((handlers) => handlers !== handler);
    };
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * ```js
   * ee.emit('tick', tickType, tickDuration)
   * ```
   *
   * @param props the props provided.
   */
  emit: Emit<Events> = (props) => {
    const results: any[] = [];

    if (!props.async) {
      for (const [index, handler] of (this.#events[props.event] ?? []).entries()) {
        const result = handler(...props.args);

        if (is.promise(result)) {
          throw new Error('Must specify `async: true` when using promises');
        }

        results.push(result);

        if (props.stopAt?.(result, index)) {
          break;
        }
      }

      return props.transformer?.(results);
    }

    // For now only support serial async emitters.

    const iteratePromiseFns = async () => {
      const events = this.#events[props.event] ?? [];

      if (props.parallel) {
        results.push(...(await Promise.all(events.map((handler) => handler(...props.args)))));
      } else {
        for (const [index, handler] of events.entries()) {
          const result = await handler(...props.args);

          results.push(result);

          if (props.stopAt?.(result, index)) {
            break;
          }
        }
      }

      return props.transformer?.(results);
    };

    return iteratePromiseFns();
  };
}

// function createProxy(fn: any, mapArgs: any, previous: Array<string>): any {
//   return new Proxy(EMPTY_FUNCTION, {
//     apply: (_target, _this, args) => {
//       const namespacedPath = previous.join(':');
//       return fn(...mapArgs(namespacedPath, args));
//     },
//     get: (_, prop) => {
//       const values: string[] = previous ? previous : [];

//       if (typeof prop !== 'string') {
//         return Function.prototype[prop as keyof Function];
//       }

//       // if (typeof Function.prototype[prop as keyof Function] === 'function') {
//       //   return (Function.prototype[prop as keyof Function] as any).bind('');
//       // }

//       return createProxy(fn, mapArgs, [...values, prop]);
//     },

//     set: (object, prop) => {
//       throw new TypeError(
//         `Cannot assign to read only property '${String(prop)}' of object '#${object}'`,
//       );
//     },
//   });
// }

// const EMPTY_FUNCTION = () => {};
// type A = keyof Function;
