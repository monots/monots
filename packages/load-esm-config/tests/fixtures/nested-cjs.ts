export default {
  "package.json": "{\n  \"type\": \"commonjs\"\n}\n",
  ".config/simple2.config.mjs": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple2',\n  filename: path.basename(new URL(import.meta.url).pathname),\n};\n",
  ".config/simple.config.js": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple',\n  filename: path.basename(__filename),\n};\n",
  ".config/simple3.config.ts": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple3',\n  filename: path.basename(__filename),\n};\n",
  ".config/simple4.config.mts": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple4',\n  filename: path.basename(new URL(import.meta.url).pathname),\n};\n"
};