/* eslint-disable import/no-extraneous-dependencies */
import { folderExists } from '@monots/utils';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function isFolderEmpty(root: string, name: string): Promise<boolean> {
  const validFiles = new Set([
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'LICENSE',
    'Thumbs.db',
    'docs',
    'mkdocs.yml',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
  ]);

  const directoryFiles = await fs.readdir(root);
  const conflicts: string[] = [];

  for (const file of directoryFiles) {
    if (validFiles.has(file) || /\.iml$/.test(file)) {
      conflicts.push(file);
    }
  }

  if (conflicts.length > 0) {
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();

    for (const file of conflicts) {
      try {
        const isFolder = await folderExists(path.join(root, file));

        if (isFolder) {
          console.log(`  ${chalk.blue(file)}/`);
        } else {
          console.log(`  ${file}`);
        }
      } catch {
        console.log(`  ${file}`);
      }
    }

    console.log();
    console.log('Either try using a new directory name, or remove the files listed above.');
    console.log();
    return false;
  }

  return true;
}
