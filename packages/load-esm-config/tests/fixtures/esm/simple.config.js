import * as path from 'node:path';

export default {
  option: 'simple',
  filename: path.basename(new URL(import.meta.url).pathname),
};
