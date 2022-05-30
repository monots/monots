import { promises as fs } from 'node:fs';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { getPackages } from '@manypkg/get-packages';
import { Pkg, baseDir } from './helpers';

/**
 * The cached packages, to prevent multiple re-computations.
 */
let packages: Promise<Pkg[]> | undefined;

/**
 * Get all dependencies.
 *
 * @param excludeDeprecated - when true exclude the deprecated packages
 */
export function getAllDependencies({
  excludeDeprecated = true,
  excludeSupport = false,
  excludePrivate = false,
}) {
  if (!packages) {
    packages = getPackages(baseDir()).then(({ packages = [] }) => {
      const transformedPackages: Pkg[] = [];

      for (const pkg of packages) {
        if (excludeSupport && pkg.dir.startsWith(baseDir('support'))) {
          continue;
        }

        if (excludeDeprecated && pkg.dir.startsWith(baseDir('deprecated'))) {
          continue;
        }

        if (excludePrivate && pkg.packageJson.private) {
          continue;
        }

        transformedPackages.push({
          ...pkg.packageJson,
          location: pkg.dir,
        });
      }

      return transformedPackages;
    });
  }

  return packages;
}

const NAME = 'CHANGELOG.md';

/**
 * Read a file.
 *
 * @param filePath The file path.
 */
async function readFile(filePath: string) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return;
  }
}

/**
 * Get the release date
 *
 * @param [date=`new Date()`] The date to use.
 */
function getDate(date = new Date()) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Check if the file has changed.
 *
 * @param filePath The file path to check.
 */
function hasFileChanged(filePath: string) {
  const isUntracked = !execSync(`git ls-files ${filePath}`).toString().trim();

  if (isUntracked) {
    return true;
  }

  return !!execSync(`git --no-pager diff --name-only ${filePath}`).toString().trim();
}

/**
 * Add dates to all updated changelog files.
 */
async function run() {
  const packages = await getAllDependencies({ excludeDeprecated: false });

  for (const pkg of packages) {
    const filePath = path.join(pkg.location, NAME);
    const contents = await readFile(filePath);

    if (!contents) {
      continue;
    }

    const updatedContent = contents.replace(
      /## (\d+)\.(\d+)\.(\d+)(?:-([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+[\dA-Za-z-]+)?$/m,
      `$&\n\n> ${getDate()}`,
    );

    if (contents === updatedContent) {
      continue;
    }

    if (!hasFileChanged(filePath)) {
      continue;
    }

    await fs.writeFile(filePath, updatedContent);

    console.log(`\u001B[32mAdded date to changelog: ${filePath}`);
  }
}

run();
