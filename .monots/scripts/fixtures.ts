import { globby } from 'globby';
import fs from 'node:fs/promises';
import path from 'node:path';

import { baseDir } from './helpers.js';

const allFixtureDirectories = await globby(baseDir('packages/*/tests/fixtures/*'), {
  onlyDirectories: true,
});

const fixtureDirectories = allFixtureDirectories.filter((dir) => !dir.endsWith('tmp'));
const promises: Array<Promise<void>> = [];

for (const folder of fixtureDirectories) {
  const promise = globby('**', { expandDirectories: true, dot: true, cwd: folder })
    .then(async (relativePaths) => {
      const promises: Array<Promise<void>> = [];
      const fileMap = new Map<string, string>();

      for (const relativePath of relativePaths) {
        const absolutePath = path.resolve(folder, relativePath);
        const promise = fs.readFile(absolutePath, 'utf8').then((content) => {
          fileMap.set(relativePath, content);
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      return fileMap;
    })
    .then(async (map) => {
      const fileObject = Object.fromEntries(map.entries());
      const fileName = path.basename(folder);
      const filePath = path.join(path.dirname(folder), `${fileName}.ts`);
      const content = `export default ${JSON.stringify(fileObject, null, 2)};`;
      await fs.writeFile(filePath, content);
    });

  // Load all the files
  promises.push(promise);
}

await Promise.all(promises);
