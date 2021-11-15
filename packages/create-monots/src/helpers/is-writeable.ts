import { constants } from 'node:fs';
import fs from 'node:fs/promises';

export async function isWriteable(directory: string): Promise<boolean> {
  try {
    await fs.access(directory, (constants || fs).W_OK);
    return true;
  } catch {
    return false;
  }
}
