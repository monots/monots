import * as fs from 'node:fs/promises';

export function asdf(filepath) {
  return fs.writeFile(filepath, 'asdf');
}
