import { MonorepoTemplate } from '@monots/core';

import { defaultMonorepoTemplate, packageDirectory, TemplateType } from './utils';

const minimal: MonorepoTemplate = {
  ...defaultMonorepoTemplate,
  name: 'minimal',
  templateFiles: ['LICENSE', 'readme.md'],
  renameFiles: { prettierignore: '.prettierignore' },
  path: packageDirectory(TemplateType.Monorepo, 'minimal'),
  devDependencies: ['@types/jest', 'husky', 'monots', 'tslib', 'typescript', 'jest'],
  createPackageJson: context => {
    return { name: 'root' };
  },
};

export const monorepos = { minimal };
