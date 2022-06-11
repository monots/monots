import { getPackages } from '@manypkg/get-packages';
import log from '@monots/logger';
import { execa } from 'execa';
import { loadJsonFile } from 'load-json-file';
import * as path from 'node:path';
import { writeJsonFile } from 'write-json-file';

import { baseDir } from './helpers.js';

const originalValues: Array<[string, string]> = [];
const files = await getPackages(baseDir()).then(({ packages }) =>
  packages
    .filter((pkg) => !pkg.packageJson.private && (pkg.packageJson as any).type === 'module')
    .map(({ dir }) => path.join(dir, 'package.json')),
);

let exit = 0;

try {
  log.warn(`temporarily adjusting the exports packages.`);
  await Promise.all(
    files.map(async (file) => {
      const json = await loadJsonFile<any>(file);
      const original = json.exports;
      json.exports = { '.': './src/index.ts' };
      await writeJsonFile(file, json, { detectIndent: true });
      originalValues.push([file, original]);
    }),
  );

  log.verbose('exports adjusted', files);
  const [script = 'false', ...rest] = process.argv.slice(2);
  await execa(script, rest, { stdio: 'inherit' });
} catch (error) {
  log.fatal(error);
  exit = 1;
} finally {
  log.info(`reverting the exports property in all packages`);
  await Promise.all(
    originalValues.map(async ([file, original]) => {
      const json = await loadJsonFile<any>(file);
      json.exports = original;
      await writeJsonFile(file, json, { detectIndent: true });
    }),
  );
  log.verbose('exports reverted', files);
  process.exit(exit);
}
