import { Writable } from 'node:stream';

import { context } from '../src/setup.js';

export { cli } from '../src/setup.js';

const stdout = new Writable();

const mockContext = { ...context, stdout, stderr: stdout };
export { mockContext as context };
