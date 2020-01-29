import { generateBaseTsConfig, generateMainTsConfig, generatePackageTsConfigs } from '@monots/core';
import updateNotifier from 'update-notifier';

import { renderGenerateTs } from './components';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

export const generateTsAction = () => {
  const generate = async () => {
    const [main, packages, base] = await Promise.all([
      generateMainTsConfig(),
      generatePackageTsConfigs(),
      generateBaseTsConfig(),
    ]);

    return async () => {
      await Promise.all([main.write(), packages.write(), base.write()]);
    };
  };

  renderGenerateTs({ generate }).then(() => {
    updateNotifier({ pkg }).notify();
  });
};
