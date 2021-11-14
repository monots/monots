/* eslint-disable import/no-extraneous-dependencies */
import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';

export function isFolderEmpty(root: string, name: string): boolean {
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

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.has(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file));

  if (conflicts.length > 0) {
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();

    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));

        if (stats.isDirectory()) {
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
