import { PackageTemplate } from '@monots/core';

import { defaultPackageTemplate, packageDirectory, TemplateType } from './utils';

const minimal: PackageTemplate = {
  ...defaultPackageTemplate,
  name: 'minimal',
  templateFiles: ['readme.md'],
  path: packageDirectory(TemplateType.Package, 'minimal'),
  createPackageJson: () => {
    return { name: 'root' };
  },
};

export const packages = { minimal };
