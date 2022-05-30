import * as fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';

import type { ExportedConfig, NodeModuleWithCompile } from './types.js';

const _require = createRequire(import.meta.url);

/**
 * Taken from https://github.com/vitejs/vite/blob/80dd2dfd8049c39e516e19ad5cfdaa1c5f02e4a3/packages/vite/src/node/config.ts#L837-L857
 */
export async function loadFromBundledFile<Config extends object = any, Argument = unknown>(
  fileName: string,
  bundledCode: string,
): Promise<ExportedConfig<Config, Argument>> {
  const extension = path.extname(fileName);
  const realFileName = await fs.realpath(fileName);
  const defaultLoader = _require.extensions[extension];

  _require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === realFileName) {
      (module as NodeModuleWithCompile)._compile(bundledCode, filename);
    } else {
      defaultLoader?.(module, filename);
    }
  };

  // clear cache in case of server restart
  Reflect.deleteProperty(_require.cache, _require.resolve(fileName));

  const raw = _require(fileName);
  const config = raw.__esModule ? raw.default : raw;
  _require.extensions[extension] = defaultLoader;
  return config;
}
