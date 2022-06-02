export default {
  "monots.config.ts": "import { defineConfig, corePlugin  } from '@monots/core';\n\n\nexport default defineConfig({\n  plugins: [\n    corePlugin(),\n    { type: 'core', name: 'custom', ready: async (props) => {} }\n  ],\n});\n",
  "package.json": "{\n  \"type\": \"module\"\n}\n"
};