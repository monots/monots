import is from '@sindresorhus/is';
import Emittery from 'emittery';

import { createChain } from './create-chain.js';
import { parseTestArgs } from './test-utils.js';
import {
  DefaultTask,
  Metadata,
  Tasks,
  TestMetadata,
  TestRunnerOptions,
} from './types/runner-types.js';
import { TestFn } from './types/test-types.js';

export class TestRunner<Context = unknown> extends Emittery implements Required<TestRunnerOptions> {
  static #runner: TestRunner;

  static get test(): TestFn {
    if (!this.#runner) {
      throw new Error('No test runner instance exists');
    }

    return this.#runner.chain;
  }

  static create(options: TestRunnerOptions): TestRunner {
    return (this.#runner ??= new TestRunner(options));
  }

  file: string;
  failFast: boolean;
  failWithoutAssertions: boolean;
  runOnlyExclusive: boolean;
  serial: boolean;
  nextTaskIndex = 0;
  tasks: Tasks = {
    after: [],
    afterAlways: [],
    afterEach: [],
    afterEachAlways: [],
    before: [],
    beforeEach: [],
    concurrent: [],
    serial: [],
    todo: [],
  };
  chain: TestFn<Context>;

  #uniqueTestTitles = new Set<string>();
  #initialized = false;

  private constructor(options: TestRunnerOptions) {
    super();

    this.file = options.file;
    this.failFast = options.failFast === true;
    this.failWithoutAssertions = options.failWithoutAssertions !== false;
    this.runOnlyExclusive = options.runOnlyExclusive === true;
    this.serial = options.serial === true;
    this.chain = createChain(
      this.#createChainImplementation,
      {
        serial: false,
        exclusive: false,
        skipped: false,
        todo: false,
        failing: false,
        callback: false,
        inline: false, // Set for attempt metadata created by `t.try()`
        always: false,
        taskIndex: -1,
      },
      { file: this.file },
    );
  }

  async start() {
    const concurrentTests = [];
    const serialTests = [];

    for (const task of this.tasks.serial) {
      if (this.runOnlyExclusive && !task.metadata.exclusive) {
        this.snapshots.skipBlock(task.title, task.metadata.taskIndex);
        continue;
      }

      if (this.checkSelectedByLineNumbers && !task.metadata.selected) {
        this.snapshots.skipBlock(task.title, task.metadata.taskIndex);
        continue;
      }

      this.emit('stateChange', {
        type: 'selected-test',
        title: task.title,
        knownFailing: task.metadata.failing,
        skip: task.metadata.skipped,
        todo: false,
      });

      if (task.metadata.skipped) {
        this.snapshots.skipBlock(task.title, task.metadata.taskIndex);
      } else {
        serialTests.push(task);
      }
    }

    for (const task of this.tasks.concurrent) {
      if (this.runOnlyExclusive && !task.metadata.exclusive) {
        this.snapshots.skipBlock(task.title, task.metadata.taskIndex);
        continue;
      }

      if (this.checkSelectedByLineNumbers && !task.metadata.selected) {
        this.snapshots.skipBlock(task.title, task.metadata.taskIndex);
        continue;
      }

      this.emit('stateChange', {
        type: 'selected-test',
        title: task.title,
        knownFailing: task.metadata.failing,
        skip: task.metadata.skipped,
        todo: false,
      });

      if (task.metadata.skipped) {
        this.snapshots.skipBlock(task.title, task.metadata.taskIndex);
      } else if (this.serial) {
        serialTests.push(task);
      } else {
        concurrentTests.push(task);
      }
    }

    for (const task of this.tasks.todo) {
      if (this.runOnlyExclusive && !task.metadata.exclusive) {
        continue;
      }

      this.emit('stateChange', {
        type: 'selected-test',
        title: task.title,
        knownFailing: false,
        skip: false,
        todo: true,
      });
    }

    if (concurrentTests.length === 0 && serialTests.length === 0) {
      this.emit('finish');
      // Don't run any hooks if there are no tests to run.
      return;
    }

    const contextRef = new ContextRef();

    // Note that the hooks and tests always begin running asynchronously.
    const beforePromise = this.runHooks(this.tasks.before, contextRef);
    const serialPromise = beforePromise.then((beforeHooksOk) => {
      // Don't run tests if a `before` hook failed.
      if (!beforeHooksOk) {
        return false;
      }

      return serialTests.reduce(async (previous, task) => {
        // eslint-disable-line unicorn/no-array-reduce
        const previousOk = await previous;

        // Don't start tests after an interrupt.
        if (this.interrupted) {
          return previousOk;
        }

        // Prevent subsequent tests from running if `failFast` is enabled and
        // the previous test failed.
        if (!previousOk && this.failFast) {
          return false;
        }

        return this.#runTest(task, contextRef.copy());
      }, true);
    });
    const concurrentPromise = Promise.all([beforePromise, serialPromise]).then(
      async ([beforeHooksOk, serialOk]) => {
        // Don't run tests if a `before` hook failed, or if `failFast` is enabled
        // and a previous serial test failed.
        if (!beforeHooksOk || (!serialOk && this.failFast)) {
          return false;
        }

        // Don't start tests after an interrupt.
        if (this.#interrupted) {
          return true;
        }

        // If a concurrent test fails, even if `failFast` is enabled it won't
        // stop other concurrent tests from running.
        const allOkays = await Promise.all(
          concurrentTests.map((task) => this.#runTest(task, contextRef.copy())),
        );
        return allOkays.every((ok) => ok);
      },
    );

    const beforeExitHandler = this.beforeExitHandler.bind(this);
    process.on('beforeExit', beforeExitHandler);

    try {
      const ok = await concurrentPromise;

      // Only run `after` hooks if all hooks and tests passed.
      if (ok) {
        await this.runHooks(this.tasks.after, contextRef);
      }

      // Always run `after.always` hooks.
      await this.runHooks(this.tasks.afterAlways, contextRef);
      process.removeListener('beforeExit', beforeExitHandler);
      await this.emit('finish');
    } catch (error) {
      await this.emit('error', error);
    }
  }

  #registerUniqueTitle = (title: string | undefined) => {
    if (!title || this.#uniqueTestTitles.has(title)) {
      return false;
    }

    this.#uniqueTestTitles.add(title);
    return true;
  };

  #notifyTimeoutUpdate = (ms: number) => {
    this.emit('stateChange', { type: 'test-timeout-configured', period: ms });
  };

  #createChainImplementation = (metadata: TestMetadata, testArgs: unknown[]) => {
    if (this.#initialized) {
      throw new Error(
        'All tests and hooks must be declared synchronously in your test file, and cannot be nested within other tests or hooks.',
      );
    }

    this.#initialized = true;

    metadata.taskIndex = this.nextTaskIndex++;

    const { args, testMethod, title } = parseTestArgs(testArgs as any);

    if (metadata.todo) {
      if (testMethod) {
        throw new TypeError(
          '`todo` tests are not allowed to have an implementation. Use `test.skip()` for tests with an implementation.',
        );
      }

      if (!title.raw) {
        // Either undefined or a string.
        throw new TypeError('`todo` tests require a title');
      }

      if (!this.#registerUniqueTitle(title.value)) {
        throw new Error(`Duplicate test title: ${title.value}`);
      }

      this.tasks.todo.push({ title: title.value, metadata, type: 'todo' });
      this.emit('stateChange', {
        type: 'declared-test',
        title: title.value,
        knownFailing: false,
        todo: true,
      });
    } else {
      if (!testMethod) {
        throw new TypeError(
          'Expected an implementation. Use `test.todo()` for tests without an implementation.',
        );
      }

      if (is.array(testMethod)) {
        throw new TypeError('Invalid `testMethod` passed to the test object.');
      }

      if (title.isSet && !title.isValid) {
        throw new TypeError('Test & hook titles must be strings');
      }

      let fallbackTitle = title.value;

      if (title.isEmpty) {
        if (metadata.type === 'test') {
          throw new TypeError('Tests must have a title');
        } else if (metadata.always) {
          fallbackTitle = `${metadata.type}.always hook`;
        } else {
          fallbackTitle = `${metadata.type} hook`;
        }
      }

      if (metadata.type === 'test' && !this.#registerUniqueTitle(title.value)) {
        throw new Error(`Duplicate test title: ${title.value}`);
      }

      const task: DefaultTask = {
        type: 'default',
        title: title.value || fallbackTitle,
        testMethod,
        args,
        metadata: { ...metadata },
      };

      if (metadata.type === 'test') {
        // When an exclusive test `.only()` is encountered set the file to only
        // run the exclusive tests.
        if (task.metadata.exclusive) {
          this.runOnlyExclusive = true;
        }

        this.tasks[metadata.serial ? 'serial' : 'concurrent'].push(task);

        this.emit('stateChange', {
          type: 'declared-test',
          title: title.value,
          knownFailing: metadata.failing,
          todo: false,
        });
      } else if (!metadata.skipped) {
        let taskName: keyof Tasks = metadata.type;

        if ((taskName === 'afterEach' || taskName === 'after') && metadata.always) {
          taskName = `${taskName}Always`;
        }

        this.tasks[taskName].push(task);
      }
    }
  };

  compareTestSnapshot(options) {
    return this.snapshots.compare(options);
  }

  skipSnapshot(options) {
    return this.snapshots.skipSnapshot(options);
  }

  saveSnapshotState() {
    return { touchedFiles: this.snapshots.save() };
  }

  onRun(runnable) {
    this.activeRunnables.add(runnable);
  }

  onRunComplete(runnable) {
    this.activeRunnables.delete(runnable);
  }

  attributeLeakedError(error) {
    for (const runnable of this.activeRunnables) {
      if (runnable.attributeLeakedError(error)) {
        return true;
      }
    }

    return false;
  }

  beforeExitHandler() {
    for (const runnable of this.activeRunnables) {
      runnable.finishDueToInactivity();
    }
  }

  async runMultiple(runnables) {
    let allPassed = true;
    const storedResults = [];
    const runAndStoreResult = async (runnable) => {
      const result = await this.runSingle(runnable);

      if (!result.passed) {
        allPassed = false;
      }

      storedResults.push(result);
    };

    let waitForSerial = Promise.resolve();
    await runnables.reduce((previous, runnable) => {
      // eslint-disable-line unicorn/no-array-reduce
      if (runnable.metadata.serial || this.serial) {
        waitForSerial = previous.then(
          () =>
            // Serial runnables run as long as there was no previous failure, unless
            // the runnable should always be run.
            (allPassed || runnable.metadata.always) && runAndStoreResult(runnable),
        );
        return waitForSerial;
      }

      return Promise.all([
        previous,
        waitForSerial.then(
          () =>
            // Concurrent runnables are kicked off after the previous serial
            // runnables have completed, as long as there was no previous failure
            // (or if the runnable should always be run). One concurrent runnable's
            // failure does not prevent the next runnable from running.
            (allPassed || runnable.metadata.always) && runAndStoreResult(runnable),
        ),
      ]);
    }, waitForSerial);

    return { allPassed, storedResults };
  }

  async runSingle(runnable) {
    this.onRun(runnable);
    const result = await runnable.run();
    // If run() throws or rejects then the entire test run crashes, so
    // onRunComplete() doesn't *have* to be inside a finally.
    this.onRunComplete(runnable);
    return result;
  }

  async runHooks(tasks, contextRef, { titleSuffix, testPassed } = {}) {
    const hooks = tasks.map(
      (task) =>
        new Runnable({
          contextRef,
          experiments: this.experiments,
          failWithoutAssertions: false,
          fn:
            task.args.length === 0
              ? task.implementation
              : (t) => Reflect.apply(task.implementation, null, [t, ...task.args]),
          compareTestSnapshot: this.boundCompareTestSnapshot,
          skipSnapshot: this.boundSkipSnapshot,
          updateSnapshots: this.updateSnapshots,
          metadata: task.metadata,
          powerAssert: this.powerAssert,
          title: `${task.title}${titleSuffix || ''}`,
          isHook: true,
          testPassed,
          notifyTimeoutUpdate: this.notifyTimeoutUpdate,
        }),
    );
    const outcome = await this.runMultiple(hooks, this.serial);

    for (const result of outcome.storedResults) {
      if (result.passed) {
        this.emit('stateChange', {
          type: 'hook-finished',
          title: result.title,
          duration: result.duration,
          logs: result.logs,
        });
      } else {
        this.emit('stateChange', {
          type: 'hook-failed',
          title: result.title,
          err: serializeError('Hook failure', true, result.error),
          duration: result.duration,
          logs: result.logs,
        });
      }
    }

    return outcome.allPassed;
  }

  async #runTest(task, contextRef) {
    const hookSuffix = ` for ${task.title}`;
    let hooksOk = await this.runHooks(this.tasks.beforeEach, contextRef, {
      titleSuffix: hookSuffix,
    });

    let testOk = false;

    if (hooksOk) {
      // Only run the test if all `beforeEach` hooks passed.
      const test = new Runnable({
        contextRef,
        experiments: this.experiments,
        failWithoutAssertions: this.failWithoutAssertions,
        fn:
          task.args.length === 0
            ? task.implementation
            : (t) => Reflect.apply(task.implementation, null, [t, ...task.args]),
        compareTestSnapshot: this.boundCompareTestSnapshot,
        skipSnapshot: this.boundSkipSnapshot,
        updateSnapshots: this.updateSnapshots,
        metadata: task.metadata,
        powerAssert: this.powerAssert,
        title: task.title,
        registerUniqueTitle: this.registerUniqueTitle,
        notifyTimeoutUpdate: this.notifyTimeoutUpdate,
      });

      const result = await this.runSingle(test);
      testOk = result.passed;

      if (testOk) {
        this.emit('stateChange', {
          type: 'test-passed',
          title: result.title,
          duration: result.duration,
          knownFailing: result.metadata.failing,
          logs: result.logs,
        });

        hooksOk = await this.runHooks(this.tasks.afterEach, contextRef, {
          titleSuffix: hookSuffix,
          testPassed: testOk,
        });
      } else {
        this.emit('stateChange', {
          type: 'test-failed',
          title: result.title,
          err: serializeError('Test failure', true, result.error, this.file),
          duration: result.duration,
          knownFailing: result.metadata.failing,
          logs: result.logs,
        });
        // Don't run `afterEach` hooks if the test failed.
      }
    }

    const alwaysOk = await this.runHooks(this.tasks.afterEachAlways, contextRef, {
      titleSuffix: hookSuffix,
      testPassed: testOk,
    });
    return alwaysOk && hooksOk && testOk;
  }
}
