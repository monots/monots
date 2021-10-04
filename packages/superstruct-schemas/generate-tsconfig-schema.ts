import { compile, JSONSchema } from 'json-schema-to-typescript';
import ky from 'ky-universal';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { generateFromTs } from 'superstruct-converter';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const JSON_URL =
  'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/tsconfig.json';

async function run() {
  // Load the TSConfig JSON Schema
  const json = await ky.get(JSON_URL).json<JSONSchema>();
  const sourceText = await compile(json, 'TsconfigJson');
  const { getContent } = generateFromTs({ sourceText });
  const content = getContent('./');
  await fs.writeFile(path.join(__dirname, 'src/schema/tsconfig.schema.ts'), content);
}

run().catch((error) => {
  console.info('Something went wrong');
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
