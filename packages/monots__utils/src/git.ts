import { execa } from 'execa';
import del from 'del';

export async function isInGitRepository(cwd = process.cwd()): Promise<boolean> {
  try {
    await execa('git', ['rev-parse', '--is-inside-work-tree'], { cwd });
    return true;
  } catch {
    // ignore the error
  }

  return false;
}

export async function isInMercurialRepository(cwd = process.cwd()): Promise<boolean> {
  try {
    await execa('hg', ['--cwd', '.', 'root'], { cwd });
    return true;
  } catch {
    // ignore the error
  }

  return false;
}

export interface GitUtilsProps {
  /**
   * The directory to run the command in.
   */
  cwd: string;

  /**
   * The main branch used for the git commands.
   *
   * @default 'main'
   */
  main?: string;
}

export class GitUtils {
  readonly cwd: string;
  readonly main: string;

  constructor(props: GitUtilsProps) {
    this.cwd = props.cwd;
    this.main = props.main ?? 'main';
  }

  /**
   * Safely checks if the current directory is a git repository.
   */
  async init(message: string = 'feat: getting started with monots 🎉🥳'): Promise<boolean> {
    const cwd = this.cwd;
    let hasInitialized = false;
    try {
      await execa('git', ['--version'], { cwd });

      if ((await isInGitRepository(cwd)) || (await isInMercurialRepository(cwd))) {
        return false;
      }

      await execa('git', ['init'], { cwd });
      hasInitialized = true;

      await execa('git', ['checkout', '-b', this.main], { cwd });
      await execa('git', ['add', '-A'], { cwd });
      await execa('git', ['commit', '-m', JSON.stringify(message)], { cwd });
      return true;
    } catch {
      if (hasInitialized) {
        try {
          await del('.git', { cwd });
        } catch {
          // ignore the error
        }
      }

      return false;
    }
  }
}
