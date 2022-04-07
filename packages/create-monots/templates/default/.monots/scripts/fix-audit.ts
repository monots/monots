import shell from 'shelljs';
import chalkTemplate from 'chalk-template';

const auditResult = shell.exec('pnpm audit --fix', {});

if (auditResult.stdout.includes('No fixes were made')) {
  chalkTemplate`{yellow no fixes required 🎉}`;
  process.exit(0);
}

console.log(chalkTemplate`{yellow updating dependencies after fixing security risks}`);
shell.exec('pnpm install');
