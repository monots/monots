import glob from 'fast-glob';
import { got } from 'got';
import { loadJsonFile } from 'load-json-file';
import { writeJsonFile } from 'write-json-file';

import { baseDir } from './helpers.js';

const DATA_ROOT_URL = 'https://data.jsdelivr.com/v1/package/npm/';

async function getLatestVersion(name: string) {
  const response: any = await got(`${DATA_ROOT_URL}${name}`).json();
  return response.tags.latest;
}

async function run() {
  // find and load package.json.template files
  const files = await glob('**/package.json.template', {
    cwd: baseDir(),
    absolute: true,
  });

  const promises = files.map(async (file) => {
    // read the json file
    const json = await loadJsonFile<any>(file);
    const dependencies = json.dependencies || {};
    const internalPromises: Array<Promise<void>> = [];

    // read the dependencies
    for (const name of Object.keys(dependencies)) {
      internalPromises.push(
        // update the dependencies to the latest versions
        getLatestVersion(name).then((version) => {
          dependencies[name] = `^${version}`;
        }),
      );
    }

    // wait for all versions to be updated
    await Promise.all(internalPromises);

    // write the updated json file
    await writeJsonFile(file, json, { indent: 2 });
  });

  await Promise.all(promises);
}

run();
