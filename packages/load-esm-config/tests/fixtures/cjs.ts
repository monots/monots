export default {
  "package.json": "{\n  \"type\": \"commonjs\"\n}\n",
  "simple.config.js": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple',\n  filename: path.basename(__filename),\n};\n",
  "simple2.config.mjs": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple2',\n  filename: path.basename(new URL(import.meta.url).pathname),\n};\n",
  "simple3.config.ts": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple3',\n  filename: path.basename(__filename),\n};\n",
  "simple4.config.mts": "import * as path from 'node:path';\n\nexport default {\n  option: 'simple4',\n  filename: path.basename(new URL(import.meta.url).pathname),\n};\n"
};