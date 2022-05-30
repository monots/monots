import chalk from 'chalk';
import chalkTemplate from 'chalk-template';
import isEqual from 'fast-deep-equal';
import { diff } from 'jest-diff';
import * as path from 'node:path';

import { FatalError } from './errors.js';

const diffOptions = {
  contextLines: 1,
  expand: false,
  aAnnotation: 'Current',
  aColor: chalk.red,
  bAnnotation: 'Expected',
  bColor: chalk.green,
  includeChangeCounts: true,
};

/**
 * Sort the keys alphabetically to produce consistent comparisons.
 */
function orderOutputKeys(output: Record<string, unknown>) {
  return Object.keys(output)
    .sort()
    .map((name) => path.relative(process.cwd(), name));
}

interface CompareOutputProps {
  actual: Record<string, unknown>;
  expected: Record<string, unknown>;
  name: string;
}

/**
 * Check that the actual output and the expected output are identical. When
 * content has changed it will throw an error with a descriptive diff.
 */
export function compareOutput(props: CompareOutputProps) {
  const { actual, expected, name } = props;
  const actualKeys = orderOutputKeys(actual);
  const expectedKeys = orderOutputKeys(expected);

  if (!isEqual(actualKeys, expectedKeys)) {
    return [
      new FatalError(
        chalkTemplate`\n{yellow The package.json file has unexpected keys.}\n\n${
          diff(actualKeys, expectedKeys, diffOptions) || ''
        }`,
        name,
      ),
    ];
  }

  const errorMessages: string[] = [];

  for (const [name, actualContents] of Object.entries(actual)) {
    const expectedContents = expected[name];
    const relativeName = path.relative(process.cwd(), name);

    if (isEqual(actualContents, expectedContents)) {
      continue;
    }

    errorMessages.push(
      chalkTemplate`{grey ${relativeName}}\n${diff(actualContents, expected[name], diffOptions)}`,
    );
  }

  if (errorMessages.length > 0) {
    return [
      new FatalError(
        chalkTemplate`\n{bold.yellow The actual content differs from expected content.}\n\n${errorMessages.join(
          '\n\n',
        )}\n`,
        name,
      ),
    ];
  }

  return [];
}
