import { notifyUpdate } from './helpers.js';
import { cli, context } from './setup.js';

cli.runExit(process.argv.slice(2), context).then(() => {
  // Check for updates available and log to the console if available.
  notifyUpdate(context);
});
