import { cursor, erase } from 'sisteransi';

import { strip } from './strip.js';

function width(str: string) {
  return [...strip(str)].length;
}

/**
 * Clear the prompt.
 */
export function clear(prompt: string, perLine: number) {
  if (!perLine) {
    return erase.line + cursor.to(0);
  }

  let rows = 0;
  const lines = prompt.split(/\r?\n/);

  for (const line of lines) {
    rows += 1 + Math.floor(Math.max(width(line) - 1, 0) / perLine);
  }

  return erase.lines(rows);
}
