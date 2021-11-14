#!/usr/bin/env node

import { notifyUpdate } from '@monots/core';
import { cli, context } from './setup.js';

cli.runExit(process.argv.slice(2), context).then(() => {
  // Check for updates available and log to the console if available.
  notifyUpdate(context);
});
