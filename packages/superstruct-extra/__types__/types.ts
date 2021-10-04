import { Struct } from 'superstruct-extra';

import { InferStructTuple } from '../src/types.js';

type A = InferStructTuple<
  [
    Struct<string>,
    Struct<number>,
    Struct<object>,
    Struct<'a'>,
    Struct<'b'>,
    Struct<'c'>,
    Struct<'d'>,
    Struct<'e'>,
    Struct<'f'>,
    Struct<'g'>,
    Struct<'h'>,
    Struct<'i'>,
    Struct<'j'>,
    Struct<'k'>,
    Struct<'l'>,
  ]
>;
