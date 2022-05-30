import { describe, expect, it } from 'vitest';

import { hasDefaultExport } from '../';

const fixtures = [
  [`export default {}`, true],
  [`\nexport\n\n\n  default\n\n\n\n  function a() {}`, true],
  [`export   {default}  from './simple-unformatted.js';`, true],
  [`export   {a,b,c,default,}  from './simple-unformatted.js';`, true],
  [`export { AWESOME as default}  from '@test/time';`, true],
  [`import {yo} from './simple-unformatted.js';\nexport {a, yo} from './b.js'`, false],
  [`export {default as yo } from './b.js'`, false],
] as const;

describe('hasDefaultExport()', () => {
  it.each(fixtures)('%s', (code, expected) => {
    expect(hasDefaultExport(code), `[${code}] should have a default export`).toBe(expected);
  });
});
