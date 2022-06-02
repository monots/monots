import { defineConfig, corePlugin  } from '@monots/core';


export default defineConfig({
  plugins: [
    corePlugin(),
    { type: 'core', name: 'custom', ready: async (props) => {} }
  ],
});
