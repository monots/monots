import { MonorepoTemplate, PackageTemplate } from '@monots/core';

import { monorepos as monorepoTemplates } from './monorepos';
import { packages as packageTemplates } from './packages';
import { defaultMonorepoTemplate, defaultPackageTemplate, TemplateType } from './utils';

export {
  copyTemplate,
  renameFiles,
  templateFiles,
  getAuthorName,
  getYarnVersion,
  packageDirectory,
  yarnSetVersionCommand,
} from './utils';

/**
 * Get the templates from the packages passed in.
 *
 * Each package should export a `monorepos` and `packages` property.
 */
export const getTemplates = (templatePackages: string[]) => {
  const monorepos: Record<string, MonorepoTemplate> = { ...monorepoTemplates };
  const packages: Record<string, PackageTemplate> = { ...packageTemplates };

  for (const templatePackage of templatePackages) {
    const template: {
      [TemplateType.Monorepo]: Record<string, Partial<MonorepoTemplate>>;
      [TemplateType.Package]: Record<string, Partial<PackageTemplate>>;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
    } = require(templatePackage);

    Object.keys(template?.monorepos ?? {}).forEach(key => {
      monorepos[key] = { ...defaultMonorepoTemplate, ...template[TemplateType.Monorepo]?.[key] };
    });

    Object.keys(template?.packages ?? {}).forEach(key => {
      packages[key] = { ...defaultPackageTemplate, ...template[TemplateType.Package]?.[key] };
    });
  }

  return { monorepos, packages };
};
