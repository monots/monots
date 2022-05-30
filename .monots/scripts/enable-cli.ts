import { loadJsonFile } from 'load-json-file';
import { exec as ex } from 'node:child_process';
import { promisify } from 'node:util';
import { writeJsonFile } from 'write-json-file';

import { baseDir } from './helpers.js';

const exec = promisify(ex);

const files = [
  baseDir('packages/monots__core/package.json'),
  baseDir('packages/monots__utils/package.json'),
  baseDir('packages/monots__types/package.json'),
  baseDir('packages/monots__cli/package.json'),
  baseDir('packages/superstruct-extra/package.json'),
];

async function run() {
  let exit = 0;
  const originalValues: Array<[string, string]> = [];

  try {
    console.log(`Temporarily pointing the exports object.`);
    await Promise.all(
      files.map(async (file) => {
        const json = await loadJsonFile<any>(file);
        const original = json.exports;
        json.exports = { '.': './src/index.ts' };
        await writeJsonFile(file, json, { detectIndent: true });
        originalValues.push([file, original]);
      }),
    );

    const script = process.argv.slice(2).join(' ');
    await exec(script);
  } catch (error) {
    console.error(error);
    exit = 1;
  } finally {
    console.log(`Reverting the exports objects`);
    await Promise.all(
      originalValues.map(async ([file, original]) => {
        const json = await loadJsonFile<any>(file);
        json.exports = original;
        await writeJsonFile(file, json, { detectIndent: true });
      }),
    );

    process.exit(exit);
  }
}

run();
