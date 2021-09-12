import { writeJsonFile } from 'write-json-file';
import { loadJsonFile } from 'load-json-file';
import { exec as ex } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import url from 'node:url';

const exec = promisify(ex);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
/**
 * Resolve a path relative to the base directory.
 *
 * @param {string[]} paths
 */
function baseDir(...paths) {
  return path.resolve(__dirname, '..', ...paths);
}

const files = [
  baseDir('packages/monots__core/package.json'),
  baseDir('packages/monots__types/package.json'),
  baseDir('packages/monots__cli/package.json'),
];

async function run() {
  let exit = 0;
  const originalValues = [];

  try {
    console.log(`Temporarily pointing the exports object.`);
    await Promise.all(
      files.map(async (file) => {
        const json = await loadJsonFile(file);
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
        const json = await loadJsonFile(file);
        json.exports = original;
        await writeJsonFile(file, json, { detectIndent: true });
      }),
    );

    process.exit(exit);
  }
}

run();
