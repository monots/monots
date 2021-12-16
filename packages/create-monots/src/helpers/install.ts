import { execa } from 'execa';
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

/**
 * Add packages to the top level workspace.
 */
export async function pnpmAdd(cwd: string, packages: string[]): Promise<void> {
  try {
    await execa('pnpm', ['add', '-W', ...packages], { cwd, stdio: 'inherit' });
  } catch (error) {
    if (isNativeError(error)) {
      console.error(`Failed to install packages: ${error.message}`);
    }

    process.exit(1);
  }
}
