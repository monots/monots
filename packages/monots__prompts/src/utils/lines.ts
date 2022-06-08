import { strip } from './strip.js';

export function lines(msg: string, perLine: number): number {
  const lines = String(strip(msg) || '').split(/\r?\n/);

  if (!perLine) {
    return lines.length;
  }

  return lines.map((l) => Math.ceil(l.length / perLine)).reduce((a, b) => a + b);
}
