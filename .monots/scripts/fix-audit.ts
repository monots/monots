import log from '@monots/logger';
import chalk from 'chalk-template';
import { execa } from 'execa';

const subprocess = execa('pnpm', ['audit', '--fix'], { stdio: 'pipe' });
const { stdout } = await subprocess;

if (stdout.includes('No fixes were made')) {
  log.log(chalk`{yellow no fixes required 🎉}`);
  process.exit(0);
}

log.info(chalk`{yellow updating dependencies after fixing security risks}`);
await execa('pnpm', ['install'], { stdio: 'inherit' });
