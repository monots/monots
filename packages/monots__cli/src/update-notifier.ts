import https from 'node:https';

/**
 * See API documentation.
 *
 * See https://github.com/jsdelivr/data.jsdelivr.com
 */
const DATA_ROOT_URL = 'https://data.jsdelivr.com/v1/package/resolve/npm/';

async function getVersion(pkg: string) {
  return new Promise<string | undefined>((resolve, reject) =>
    https.get(`${DATA_ROOT_URL}${pkg}`, (response) => {
      response.on('data', (data) => {
        try {
          resolve(JSON.parse(data).version);
        } catch (error) {
          reject(error);
        }
      });

      response.on('error', (error) => {
        reject(error);
      });
    }),
  );
}
