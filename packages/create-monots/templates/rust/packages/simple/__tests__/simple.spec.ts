import { describe, expect, it } from 'vitest';

describe('simple', () => {
  it('can run tests', () => {
    expect('awesome').toMatchInlineSnapshot('"awesome"');
  });
});
