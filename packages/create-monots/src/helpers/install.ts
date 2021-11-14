import execa from 'execa';
import { isNativeError } from 'node:util/types';

/**
 * Run `pnpm install` in the provided directory
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export async function pnpmInstall(cwd: string): Promise<void> {
  try {
    await execa('pnpm', ['install'], { cwd });
  } catch (error) {
    if (isNativeError(error)) {
      console.error(`Failed to install packages: ${error.message}`);
    }

    console.log();
    console.log(
      'Currently `create-monots` requires either a global installation of [pnpm](https://pnpm.io/installation) or [corepack](https://github.com/nodejs/corepack) to be installed and enabled.',
    );

    process.exit(1);
  }
}
