// @ts-ignore
import isCI from 'is-ci';
import Worker from 'jest-worker';

const shouldUseWorker =
  process.env.DISABLE_PRECONSTRUCT_WORKER !== 'true' && process.env.NODE_ENV !== 'test' && !isCI;

let worker: (Worker & typeof import('./worker')) | void;

const unsafeRequire = require;

export function createWorker() {
  worker = shouldUseWorker
    ? (new Worker(require.resolve('@monots/cli/worker')) as Worker & typeof import('./worker'))
    : unsafeRequire('@monots/cli/worker');
}

export function destroyWorker() {
  if (worker !== undefined && shouldUseWorker) {
    worker.end();
    worker = undefined;
  }
}

export function getWorker() {
  if (worker === undefined) {
    throw new Error('worker not defined');
  }

  return worker;
}
