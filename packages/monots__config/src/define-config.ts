import type { MonotsConfig } from '@monots/types';
import type { ExportedConfig } from 'load-esm-config';

/**
 * Define the monots configuration.
 *
 * This is used to provide the configuration to the Command Line App, VsCode
 * extension and `@monots/api.
 *
 * @param config - the configuration to use can be an object, a function or a
 */
export function defineConfig(config: ExportedConfig<MonotsConfig>): ExportedConfig<MonotsConfig> {
  return config;
}
