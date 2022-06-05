import chalk from 'chalk-template';
import { execa } from 'execa';

const subprocess = execa('pnpm', ['audit', '--fix'], { stdio: 'pipe' });
// subprocess.stdout?.pipe(process.stdout);
const { stdout } = await subprocess;

if (stdout.includes('No fixes were made')) {
  console.log(chalk`{yellow no fixes required 🎉}`);
  process.exit(0);
}

console.log(chalk`{yellow updating dependencies after fixing security risks}`);
await execa('pnpm', ['install'], { stdio: 'inherit' });
