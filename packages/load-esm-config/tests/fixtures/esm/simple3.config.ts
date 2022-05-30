import * as path from 'node:path';

export default {
  option: 'simple3',
  filename: path.basename(new URL(import.meta.url).pathname),
};
