import { delay } from '@monots/test';
import { expect, test, vi } from 'vitest';

import { Emitter } from '../';

interface Events {
  async: (a: string) => Promise<number>;
  sync: (a: number) => string;
}

type Mapped<Type> = { [Key in keyof Type]: Type[Key] };

test('synchronous emitter', () => {
  const emitter = new Emitter<Mapped<Events>>();
  const handler = vi.fn(() => 'hello');
  emitter.on('sync', handler);

  const value = emitter.emit({
    args: [1],
    event: 'sync',
    transformer: (values) => values.join(','),
  });

  expect(value).toMatchInlineSnapshot('"hello"');
  expect(handler).toHaveBeenCalledWith(1);
});

test('early stop with synchronous emitter', () => {
  const emitter = new Emitter<Mapped<Events>>();
  emitter.on('sync', () => '1');
  emitter.on('sync', () => '2');
  emitter.on('sync', () => '3');

  const value = emitter.emit({
    args: [1],
    event: 'sync',
    transformer: (values) => values.join(','),
    stopAt: (value) => value === '2',
  });

  expect(value).toMatchInlineSnapshot('"1,2"');
});

test('throws error when return promises in non-async mode', () => {
  const emitter = new Emitter<Mapped<Events>>();
  // @ts-expect-error - purely for testing purposes
  emitter.on('sync', () => Promise.resolve(1));

  expect(() =>
    emitter.emit({
      args: [1],
      event: 'sync',
      transformer: (values) => values.join(','),
    }),
  ).toThrowErrorMatchingInlineSnapshot('"Must specify `async: true` when using promises"');
});

test('serial asynchronous emitter', async () => {
  const emitter = new Emitter<Mapped<Events>>();
  const mock = vi.fn((val: number) => val);
  emitter.on('async', () =>
    delay(30)
      .then(() => 1)
      .then(mock),
  );
  emitter.on('async', () =>
    delay(20)
      .then(() => 2)
      .then(mock),
  );
  emitter.on('async', () =>
    delay(10)
      .then(() => 3)
      .then(mock),
  );

  const value = await emitter.emit({
    args: ['1'],
    event: 'async',
    async: true,
    transformer: (values) => values.join(','),
  });

  expect(mock.mock.calls).toEqual([[1], [2], [3]]);
  expect(value).toMatchInlineSnapshot('"1,2,3"');
});

test('parallel asynchronous emitter', async () => {
  const emitter = new Emitter<Mapped<Events>>();
  const mock = vi.fn((val: number) => val);
  emitter.on('async', () =>
    delay(30)
      .then(() => 1)
      .then(mock),
  );
  emitter.on('async', () =>
    delay(20)
      .then(() => 2)
      .then(mock),
  );
  emitter.on('async', () =>
    delay(10)
      .then(() => 3)
      .then(mock),
  );

  const value = await emitter.emit({
    args: ['1'],
    event: 'async',
    parallel: true,
    async: true,
    transformer: (values) => values.join(','),
  });

  expect(mock.mock.calls).toEqual([[3], [2], [1]]);
  expect(value).toMatchInlineSnapshot('"1,2,3"');
});
