import type { Metadata, TestMetadata } from './types/runner-types.js';
import type { Implementation, Meta, TestFn } from './types/test-types.js';

type CallFn = (metadata: TestMetadata, args: unknown[]) => unknown;
type AnyImplementation = Implementation<unknown[]> & { [key: string]: any };
type ChainRegistryValue =
  | {
      root: true;
      fullName: string;
      call: CallFn;
      defaults: TestMetadata;
    }
  | {
      root?: false;
      fullName: string;
      flag: string;
      prev?: AnyImplementation;
    };

const chainRegistry = new WeakMap<AnyImplementation, ChainRegistryValue>();

function startChain<Context = unknown>(
  name: string,
  call: CallFn,
  defaults: TestMetadata,
): TestFn<Context> {
  const testMethod = (...args: unknown[]) => {
    call({ ...defaults }, args);
  };

  Object.defineProperty(testMethod, 'name', { value: name });
  chainRegistry.set(testMethod, { call, defaults, fullName: name, root: true });
  return testMethod as TestFn<Context>;
}

function extendChain(previous: any, name: string, flag?: string) {
  const testMethod = (...args: unknown[]) => {
    callWithFlag(previous, flag ?? name, args);
  };

  const fullName = `${chainRegistry.get(previous)?.fullName}.${name}`;
  Object.defineProperty(testMethod, 'name', { value: fullName });
  previous[name] = testMethod;

  chainRegistry.set(testMethod, { flag: flag ?? name, fullName, prev: previous });
  return testMethod;
}

function callWithFlag(previous: any, flag: string, args: unknown[]) {
  const combinedFlags = { [flag]: true };

  do {
    const step = chainRegistry.get(previous);

    if (step?.root) {
      step.call({ ...step.defaults, ...combinedFlags }, args);
      previous = null;
    } else {
      combinedFlags[step?.flag ?? ''] = true;
      previous = step?.prev;
    }
  } while (previous);
}

function createHookChain(hook: any, isAfterHook: boolean) {
  // Hook chaining rules:
  // * `always` comes immediately after "after hooks"
  // * `skip` must come at the end
  // * no `only`
  // * no repeating
  extendChain(hook, 'skip', 'skipped');

  if (isAfterHook) {
    extendChain(hook, 'always');
    extendChain(hook.always, 'skip', 'skipped');
  }

  return hook;
}

export function createChain<Context = unknown>(
  testMethod: CallFn,
  defaults: Metadata,
  meta: Meta,
): TestFn<Context> {
  // Test chaining rules:
  // * `serial` must come at the start
  // * `only` and `skip` must come at the end
  // * `failing` must come at the end, but can be followed by `only` and `skip`
  // * `only` and `skip` cannot be chained together
  // * no repeating
  const root = startChain<Context>('test', testMethod, { ...defaults, type: 'test' });
  extendChain(root, 'failing');
  extendChain(root, 'only', 'exclusive');
  extendChain(root, 'serial');
  extendChain(root, 'skip', 'skipped');
  extendChain(root.failing, 'only', 'exclusive');
  extendChain(root.failing, 'skip', 'skipped');
  extendChain(root.serial, 'failing');
  extendChain(root.serial, 'only', 'exclusive');
  extendChain(root.serial, 'skip', 'skipped');
  extendChain(root.serial.failing, 'only', 'exclusive');
  extendChain(root.serial.failing, 'skip', 'skipped');

  root.after = createHookChain(
    startChain<Context>('test.after', testMethod, { ...defaults, type: 'after' }),
    true,
  );
  root.afterEach = createHookChain(
    startChain<Context>('test.afterEach', testMethod, { ...defaults, type: 'afterEach' }),
    true,
  );
  root.before = createHookChain(
    startChain<Context>('test.before', testMethod, { ...defaults, type: 'before' }),
    false,
  );
  root.beforeEach = createHookChain(
    startChain<Context>('test.beforeEach', testMethod, { ...defaults, type: 'beforeEach' }),
    false,
  );

  root.serial.after = createHookChain(
    startChain<Context>('test.after', testMethod, { ...defaults, serial: true, type: 'after' }),
    true,
  );
  root.serial.afterEach = createHookChain(
    startChain<Context>('test.afterEach', testMethod, {
      ...defaults,
      serial: true,
      type: 'afterEach',
    }),
    true,
  );
  root.serial.before = createHookChain(
    startChain<Context>('test.before', testMethod, { ...defaults, serial: true, type: 'before' }),
    false,
  );
  root.serial.beforeEach = createHookChain(
    startChain<Context>('test.beforeEach', testMethod, {
      ...defaults,
      serial: true,
      type: 'beforeEach',
    }),
    false,
  );

  // "todo" tests cannot be chained. Allow todo tests to be flagged as needing
  // to be serial.
  root.todo = startChain<Context>('test.todo', testMethod, {
    ...defaults,
    type: 'test',
    todo: true,
  }) as any;
  root.serial.todo = startChain<Context>('test.serial.todo', testMethod, {
    ...defaults,
    serial: true,
    type: 'test',
    todo: true,
  }) as any;

  root.macro = (options) => {
    if (typeof options === 'function') {
      return Object.freeze({ exec: options });
    }

    return Object.freeze({ exec: options.exec, title: options.title });
  };

  root.meta = meta;

  return root;
}
