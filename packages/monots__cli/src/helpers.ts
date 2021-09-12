import path from 'node:path';
import url from 'node:url';
import { readPackageUpSync } from 'read-pkg-up';
import updateNotifier from 'update-notifier';

import type { CommandContext } from './types';

/**
 * Notify the user of available updates to the CLI.
 */
export const notifyUpdate = (context: CommandContext) => {
  const { name, internal, version } = context;

  if (internal) {
    return;
  }

  updateNotifier({ pkg: { name, version } }).notify();
};

export function getPackageJson() {
  const cwd = path.dirname(url.fileURLToPath(import.meta.url));
  const packageJson = readPackageUpSync({ cwd })?.packageJson;

  if (!packageJson) {
    throw new Error('Invalid installation of `monots`');
  }

  return packageJson;
}
