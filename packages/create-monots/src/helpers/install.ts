import { execa } from 'execa';
import { isNativeError } from 'node:util/types';

interface PnpmInstallOptions {
  ignoreScripts?: boolean;
}

/**
 * Run `pnpm install` in the provided directory
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export async function pnpmInstall(
  cwd: string,
  { ignoreScripts }: PnpmInstallOptions = {},
): Promise<void> {
  try {
    const args = ['install'];

    if (ignoreScripts) {
      args.push('--ignore-scripts');
    }

    await execa('pnpm', args, { cwd, stdio: 'inherit' });
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

/**
 * Run a command.
 */
export async function pnpmRun(cwd: string, command: string, ...rest: string[]): Promise<void> {
  try {
    await execa('pnpm', ['run', command, ...rest], { cwd, stdio: 'inherit' });
  } catch (error) {
    if (isNativeError(error)) {
      console.error(`Failed to run the command: ${error.message}`);
    }

    process.exit(1);
  }
}
