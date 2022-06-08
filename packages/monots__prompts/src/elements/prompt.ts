import { type Emitter, createNanoEvents, type Unsubscribe } from 'nanoevents';
import type { Interface as ReadlineInterface, Key } from 'node:readline';
import readline from 'node:readline';
import type picocolors from 'picocolors';
import color from 'picocolors';
import { beep, cursor } from 'sisteransi';

import type { BasePrompt, BaseProps } from '../types.js';
import type { PromptActions } from '../utils';
import { getActionFromKeyPress } from '../utils';

/**
 * Base prompt skeleton
 */
export abstract class Prompt<Value = unknown> {
  #onRender: BasePrompt['onRender'];
  #readline: ReadlineInterface;
  #emitter: PromptEmitter = createNanoEvents();

  /**
   * True when rendering for the first time.
   */
  firstRender: boolean;

  /**
   * @default process.stdin
   */
  in: NodeJS.ReadStream;

  /**
   * @default process.stdout
   */
  out: NodeJS.WriteStream;
  aborted = false;
  exited = false;
  closed = false;

  /**
   * When true this will be treated as a select prompt.
   */
  isSelect = false;

  /**
   * The value of the prompt.
   */
  abstract get value(): Value;

  constructor(props: PromptProps = {}) {
    this.firstRender = true;
    this.in = props.stdin ?? process.stdin;
    this.out = props.stdout ?? process.stdout;

    this.#onRender = props.onRender;
    this.#readline = readline.createInterface({
      input: this.in,
      escapeCodeTimeout: 50,
    });

    readline.emitKeypressEvents(this.in, this.#readline);

    if (this.in.isTTY) {
      this.in.setRawMode(true);
    }

    this.in.on('keypress', this.#keypress);
  }

  fire() {
    this.emit('state', {
      value: this.value,
      aborted: !!this.aborted,
      exited: !!this.exited,
    });
  }

  /**
   * Ring a bell for invalid input.
   */
  invalid() {
    this.out.write(beep);
  }

  render() {
    this.onRender(color);

    if (this.firstRender) {
      this.firstRender = false;
    }
  }

  readonly on = <K extends keyof Events>(event: K, callback: Events[K]): Unsubscribe => {
    return this.#emitter.on(event, callback);
  };

  readonly emit = <K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void => {
    return this.#emitter.emit(event, ...args);
  };

  readonly once = <K extends keyof Events>(event: K, callback: Events[K]): Unsubscribe => {
    const unsubscribe = this.#emitter.on(event, (...args: any[]) => {
      unsubscribe();
      callback(...(args as [any]));
    });

    return unsubscribe;
  };

  readonly onRender = (color: typeof picocolors) => {
    this.#onRender?.call(this, color);
  };

  readonly close = () => {
    this.out.write(cursor.show);
    this.in.removeListener('keypress', this.#keypress);

    if (this.in.isTTY) {
      this.in.setRawMode(false);
    }

    this.#readline.close();
    this.emit(this.aborted ? 'abort' : this.exited ? 'exit' : 'submit', this.value);
    this.closed = true;
  };

  readonly #keypress = (value: string, key: Key) => {
    const action = getActionFromKeyPress(key, this.isSelect);

    if (action === 'unknown') {
      return this.unknown?.(value, key);
    }

    const method = this[action];

    if (method) {
      return method(key);
    }

    return this.invalid();
  };
}

export interface Prompt extends Partial<PromptActions> {}

export interface PromptProps extends BaseProps {}

export interface PromptState {
  value: any;
  aborted: boolean;
  exited: boolean;
}

export interface Events {
  state: (state: PromptState) => void;
  abort: (value: any) => void;
  exit: (value: any) => void;
  submit: (value: any) => void;
}

export type PromptEmitter = Emitter<Events>;
