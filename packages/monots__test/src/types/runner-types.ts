import { ImplementationFn } from './test-types.js';

export interface TestOptions {
  /**
   * @default false
   */
  failFast?: boolean;

  /**
   * @default true
   */
  failWithoutAssertions?: boolean;

  /**
   * @default false
   */
  runOnlyExclusive?: boolean;

  /**
   * @default false
   */
  serial?: boolean;
}

export interface TestRunnerOptions extends TestOptions {
  /**
   * The path to the test file.
   */
  file: string;
}

export interface Metadata {
  serial: boolean;
  exclusive: boolean;
  skipped: boolean;
  todo: boolean;
  failing: boolean;
  callback: boolean;
  inline: boolean; // Set for attempt metadata created by `t.try()`
  always: boolean;
  taskIndex: number;
}

export interface TestMetadata extends Metadata {
  type: 'test' | 'before' | 'beforeEach' | 'after' | 'afterEach';
}

export interface DefaultTask {
  title: string;
  type:
    | 'after'
    | 'afterAlways'
    | 'afterEach'
    | 'afterEachAlways'
    | 'before'
    | 'beforeEach'
    | 'concurrent'
    | 'serial'
    | 'default';
  testMethod: ImplementationFn<any[]>;
  args?: any[];
  metadata: Metadata;
}

export interface TodoTask {
  type: 'todo';
  title: string;
  metadata: Metadata;
}

export type Task = TodoTask | DefaultTask;

export interface Tasks {
  after: DefaultTask[];
  afterAlways: DefaultTask[];
  afterEach: DefaultTask[];
  afterEachAlways: DefaultTask[];
  before: DefaultTask[];
  beforeEach: DefaultTask[];
  concurrent: DefaultTask[];
  serial: DefaultTask[];
  todo: TodoTask[];
}
