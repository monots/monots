import * as fs from 'node:fs/promises';

export async function makeDir(root: string): Promise<void> {
  await fs.mkdir(root, { recursive: true });
}
