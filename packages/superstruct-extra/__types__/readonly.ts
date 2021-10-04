import { test } from '@monots/types';

import * as s from '../src';

test<readonly string[]>((x) => {
  s.assert(x, s.readonly(s.array(s.string())));
  return x;
});

// @ts-expect-error
test<string[]>((x) => {
  s.assert(x, s.readonly(s.array(s.string())));
  return x;
});

test<readonly [string, number, boolean]>((x) => {
  s.assert(x, s.readonly(s.tuple([s.string(), s.number(), s.boolean()])));
  return x;
});

// @ts-expect-error
test<[string, number, boolean]>((x) => {
  s.assert(x, s.readonly(s.tuple([s.string(), s.number(), s.boolean()])));
  return x;
});

test<ReadonlyMap<string, number>>((x) => {
  s.assert(x, s.readonly(s.map(s.string(), s.number())));
  return x;
});

// @ts-expect-error
test<Map<string, number>>((x) => {
  s.assert(x, s.readonly(s.map(s.string(), s.number())));
  return x;
});

test<ReadonlySet<string>>((x) => {
  s.assert(x, s.readonly(s.set(s.string())));
  return x;
});

// @ts-expect-error
test<Set<string>>((x) => {
  s.assert(x, s.readonly(s.set(s.string())));
  return x;
});

test<Readonly<{ a: string }>>((x) => {
  s.assert(x, s.readonly(s.object({ a: s.string() })));
  return x;
});

// // @ts-expect-error
// test<{ a: string }>((x) => {
//   s.assert(x, s.readonly(s.object({ a: s.string() })));
//   return x;
// });

const a = s.readonly(s.object({ a: s.string() }));
declare const b: s.Infer<typeof a>;
// @ts-expect-error
b.a = '';
