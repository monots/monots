/**
 * @param msg The message to wrap
 * @param options
 */
export function wrap(msg: string, options: WrapOptions = {}) {
  const margin = `${options.margin ?? ''}`;
  const tab = Number.isSafeInteger(Number.parseInt(margin, 10))
    ? Array.from({ length: Number.parseInt(margin) })
        .fill(' ')
        .join('')
    : margin;

  const width = options.width ?? 0;

  return (msg || '')
    .split(/\r?\n/g)
    .map((line) => {
      const words = line.split(/\s+/g);
      const items = [tab];

      for (const word of words) {
        const endIndex = items.length - 1;

        if (
          word.length + tab.length >= width ||
          (items[endIndex]?.length ?? 0 + word.length + 1 < width)
        ) {
          items[endIndex] += ` ${word}`;
        } else {
          items.push(`${tab}${word}`);
        }
      }

      return items.join('\n');
    })
    .join('\n');
}

export interface WrapOptions {
  /**
   * Left margin
   */
  margin?: number | string;

  /**
   * Maximum characters per line including the margin
   */
  width?: number;
}
