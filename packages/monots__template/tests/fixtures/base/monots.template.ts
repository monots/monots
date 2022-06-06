import { defineTemplate } from '@monots/template';
import * as path from 'node:path';

export default defineTemplate({
  gatherVariables: async () => {
    return { name: 'base', description: 'a base test', version: '1.0.0' }
  },
  installCommand: ['touch', ['installed.txt']],
  renamePaths: () => ({ignore: ['./ignore-me.md', 'package.json'], rename: {'./rename-me.md': './rename-thee.md'}}),
  postInstall: async ({destination, copy, write}) => {
    await copy({source: './asdf', destination: 'node_modules/asdf'});
    await write(path.join(destination, 'asdf.txt'), 'asdf');
  }
});
