import type { DefineMonotsTemplate } from './types.js';

/**
 * The code for the template file `monots.template.ts` is called before
 * installation of any dependencies. Therefore it's not possible to rely on any
 * external packages.
 *
 * To mitigate this issue you can use this `defineTemplate` function to receive
 * all the types and dependencies since the file is called by `monots` before
 * installation.
 */
export function defineTemplate(config: DefineMonotsTemplate): DefineMonotsTemplate {
  return config;
}
