import execa from 'execa';
import { isNativeError } from 'node:util/types';

/**
 * Run `pnpm install` in the provided directory
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export async function pnpmInstall(cwd: string): Promise<void> {
  try {
    await execa('pnpm', ['install'], { cwd, stdio: 'inherit' });
  } catch (error) {
    if (isNativeError(error)) {
      console.error(`Failed to install packages: ${error.message}`);
    }

    process.exit(1);
  }
}
