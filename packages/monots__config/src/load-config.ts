import type { MonotsConfig } from '@monots/types';
import type { LoadEsmConfigOptions } from 'load-esm-config';
import { loadEsmConfig } from 'load-esm-config';
import type { Except } from 'type-fest';

/**
 * Load the monots configuration object.
 */
export async function loadConfig(options: Except<LoadEsmConfigOptions, 'name' | 'getArgument'>) {
  return loadEsmConfig<MonotsConfig>({ ...options, name: 'monots' });
}
