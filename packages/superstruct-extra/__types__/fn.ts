import { test } from '@monots/types';

import * as s from '../src';

test<() => void>((x) => {
  s.assert(x, s.fn(s.args(), s.nullish('void')));
  return x;
});

test<(a: number) => string>((x) => {
  s.assert(x, s.fn(s.args(s.number()), s.string()));
  return x;
});

test<(() => void) & ((...args: string[]) => void)>((x) => {
  s.assert(x, s.fn(s.array(s.string()), s.nullish('void')));
  return x;
});
