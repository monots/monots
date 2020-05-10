import { MonorepoTemplate } from '@monots/core';

import { defaultMonorepoTemplate, getAuthorName, packageDirectory, TemplateType } from './utils';

const scripts = {
  build: 'monots build',
  test: 'monots test',
  lint: 'monots lint',
  release: 'changeset release',
};

const minimal: MonorepoTemplate = {
  ...defaultMonorepoTemplate,
  name: 'minimal',
  templateFiles: ['LICENSE', 'readme.md'],
  renameFiles: { prettierignore: '.prettierignore' },
  path: packageDirectory(TemplateType.Monorepo, 'minimal'),
  devDependencies: ['@types/jest', 'husky', 'monots', 'tslib', 'typescript', 'jest'],
  createPackageJson: ({ name, license = 'MIT' }) => {
    return {
      name: 'root',
      private: true,
      description: `The root package.json file for the ${name} project`,
      scripts,
      workspaces: {
        packages: ['packages/*'],
      },
      license,
      author: getAuthorName(),
      engines: {
        node: '>=10',
      },
    };
  },
};

export const monorepos = { minimal };
