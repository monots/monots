/* eslint-disable import/no-extraneous-dependencies */
import { exec as _e } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import _r from 'rimraf';

const exec = promisify(_e);
const rimraf = promisify(_r);

async function isInGitRepository(): Promise<boolean> {
  try {
    await exec('git rev-parse --is-inside-work-tree');
    return true;
  } catch {
    // ignore the error
  }

  return false;
}

async function isInMercurialRepository(): Promise<boolean> {
  try {
    await exec('hg --cwd . root');
    return true;
  } catch {
    // ignore the error
  }

  return false;
}

export async function tryGitInit(root: string): Promise<boolean> {
  let didInit = false;
  try {
    await exec('git --version');

    if ((await isInGitRepository()) || (await isInMercurialRepository())) {
      return false;
    }

    await exec('git init');
    didInit = true;

    await exec('git checkout -b main');

    await exec('git add -A');
    await exec('git commit -m "Initial commit from Create Next App"');
    return true;
  } catch {
    if (didInit) {
      try {
        await rimraf(path.join(root, '.git'));
      } catch {
        // ignore the error
      }
    }

    return false;
  }
}
