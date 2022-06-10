import { type Reporter, type ReporterLogProps, Logger } from '@monots/logger';
import { delay } from '@monots/test';
import { test } from 'vitest';

test('can set level', ({ expect }) => {
  const logger = new Logger();
  expect(logger.level).toBe(3);

  for (let i = 0; i <= 5; i++) {
    logger.level = i;
    expect(logger.level).toBe(i);
  }
});

test("silent log level does't print logs", async ({ expect }) => {
  const logs: ReporterLogProps[] = [];

  class TestReporter implements Reporter {
    log(props: ReporterLogProps) {
      logs.push(props);
    }
  }

  const logger = new Logger({
    throttle: 100,
    level: 'silent',
    reporters: [new TestReporter()],
  });

  for (let i = 0; i < 10; i++) {
    logger.log('SPAM');
  }

  await delay(200);
  expect(logs.length).toBe(0);
});

test('can see spams without ending log', async ({ expect }) => {
  const logs: ReporterLogProps[] = [];

  class TestReporter implements Reporter {
    log(props: ReporterLogProps) {
      logs.push(props);
    }
  }

  const logger = new Logger({
    throttle: 100,
    reporters: [new TestReporter()],
  });

  for (let i = 0; i < 10; i++) {
    logger.log('SPAM');
  }

  await delay(200);
  expect(logs.length).toBe(7);

  // 6 + Last one indicating it repeated 4
  expect(logs.at(-1)?.args).toEqual(['SPAM', '(repeated 4 times)']);
});
