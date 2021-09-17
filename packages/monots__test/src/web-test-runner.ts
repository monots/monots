import {
  getConfig,
  sessionFailed,
  sessionFinished,
  sessionStarted,
  TestResultError,
} from '@web/test-runner-core/browser/session.js';

import { TestRunner } from './test-runner';
import { TestOptions } from './types';

async function run() {
  // notify the test runner that we're alive
  sessionStarted();

  // fetch the config for this test run, this will tell you which file we're testing
  const { testFile, watch, debug, testFrameworkConfig } = await getConfig();
  const errors: TestResultError[] = [];

  const runner = TestRunner.create({
    file: testFile,
    ...(testFrameworkConfig as TestOptions),
  });

  // load the test file as an es module
  await import(new URL(testFile, document.baseURI).href).catch((error) => {
    errors.push({ message: error.message, stack: error.stack, name: `Import Error: ${testFile}` });
  });

  try {
    // run the actual tests, this is what you need to implement
    const testResults = await runner.start();

    // notify tests run finished
    sessionFinished({
      passed: errors.length === 0 && testResults.passed,
      errors,
      testResults,
    });
  } catch (error) {
    // notify an error occurred
    sessionFailed(error);
    return;
  }
}

run();
