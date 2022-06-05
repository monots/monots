import { defineTemplate } from '@monots/template';

export default defineTemplate({
  gatherVariables: async () => {
    return { name: 'base', description: 'a base test', version: '1.0.0' }
  },
  installCommand: ['touch', ['installed.txt']],
  renamePaths: () => ({ignore: ['./ignore-me.md'], rename: {'./rename-me.md': './rename-thee.md'}}),
});
