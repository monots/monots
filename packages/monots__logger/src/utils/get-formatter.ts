import {} from 'type-fest';
import {} from 'ts-extras';
import pc from 'picocolors';
import { Formatter } from 'picocolors/types.js';
import { AnsiForegroundColor, AnsiFormat } from '../types.js';

interface AnsiFormatterProps {
  color?: AnsiForegroundColor;
  background?: Exclude<AnsiForegroundColor, 'gray'>;
  format?: AnsiFormat;
  reset?: boolean;
}

function getBackgroundColor<Color extends Exclude<AnsiForegroundColor, 'gray'>>(
  color: Color,
): `bg${Capitalize<Color>}` {
  return `bg${color.substring(0, 1).toUpperCase()}${color.substring(
    1,
  )}` as `bg${Capitalize<Color>}`;
}

export function getFormatter(props: AnsiFormatterProps = {}): Formatter {
  const { background, color, format, reset = false } = props;

  if (reset || format === 'reset') {
    return pc.reset;
  }

  return (input) => {
    let result = input ? `${input}` : '';

    if (color) {
      result = pc[color](result);
    }

    if (background) {
      result = pc[getBackgroundColor(background)](result);
    }

    if (format) {
      result = pc[format](result);
    }

    return result;
  };
}
