import colors from 'picocolors';

import { figures } from './figures.js';

// rendering user input.
export const styles = Object.freeze({
  password: { scale: 1, render: (input: string) => '*'.repeat(input.length) },
  emoji: { scale: 2, render: (input: string) => '😃'.repeat(input.length) },
  invisible: { scale: 0, render: (_input: string) => '' },
  default: { scale: 1, render: (input: string) => `${input}` },
});

export const render = (type: keyof typeof styles) => styles[type] || styles.default;

// icon to signalize a prompt.
export const symbols = Object.freeze({
  aborted: colors.red(figures.cross),
  done: colors.green(figures.tick),
  exited: colors.yellow(figures.cross),
  default: colors.cyan('?'),
});

export const symbol = (done: boolean, aborted: boolean, exited?: boolean) =>
  aborted ? symbols.aborted : exited ? symbols.exited : done ? symbols.done : symbols.default;

// between the question and the user's input.
export const delimiter = (completing: boolean): string =>
  colors.gray(completing ? figures.ellipsis : figures.pointerSmall);

export const item = (expandable: boolean, expanded: boolean): string =>
  colors.gray(expandable ? (expanded ? figures.pointerSmall : '+') : figures.line);
