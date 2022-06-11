import color from 'kleur';
import { cursor, erase } from 'sisteransi';

import type { BaseProps } from '../types.js';
import type { Action, UnknownAction } from '../utils';
import { clear, style } from '../utils';
import { Prompt } from './prompt';

/**
 * TogglePrompt Base Element
 * @param {Object} opts Options
 * @param {String} opts.message Message
 * @param {Boolean} [opts.initial=false] Default value
 * @param {String} [opts.active='no'] Active label
 * @param {String} [opts.inactive='off'] Inactive label
 * @param {Stream} [opts.stdin] The Readable stream to listen to
 * @param {Stream} [opts.stdout] The Writable stream to write readline data to
 */
export class TogglePrompt extends Prompt<boolean> {
  message: string;
  done = false;
  value: boolean;
  active: string;
  inactive: string;
  initialValue: boolean;
  outputText = '';

  constructor(props: TogglePromptProps) {
    super(props);
    this.message = props.message;
    this.value = !!props.initial;
    this.active = props.active ?? 'on';
    this.inactive = props.inactive ?? 'off';
    this.initialValue = this.value;
    this.render();
  }

  override readonly reset: Action = () => {
    this.value = this.initialValue;
    this.fire();
    this.render();
  };

  override readonly exit: Action = (key) => {
    this.abort(key);
  };

  override readonly abort: Action = () => {
    this.done = this.aborted = true;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  };

  override readonly submit: Action = () => {
    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  };

  deactivate() {
    if (this.value === false) {
      return this.invalid();
    }

    this.value = false;
    this.render();
  }

  activate() {
    if (this.value === true) {
      return this.invalid();
    }

    this.value = true;
    this.render();
  }

  override readonly delete: Action = () => {
    this.deactivate();
  };
  override readonly left: Action = () => {
    this.deactivate();
  };
  override readonly right: Action = () => {
    this.activate();
  };
  override readonly down: Action = () => {
    this.deactivate();
  };
  override readonly up: Action = () => {
    this.activate();
  };

  override readonly next: Action = () => {
    this.value = !this.value;
    this.fire();
    this.render();
  };

  override readonly unknown: UnknownAction = (char) => {
    switch (char) {
      case ' ': {
        this.value = !this.value;

        break;
      }
      case '1': {
        this.value = true;

        break;
      }
      case '0': {
        this.value = false;

        break;
      }
      default:
        return this.invalid();
    }

    this.render();
  };

  override render() {
    if (this.closed) {
      return;
    }

    if (this.firstRender) {
      this.out.write(cursor.hide);
    } else {
      this.out.write(clear(this.outputText, this.out.columns));
    }

    super.render();

    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.message),
      style.delimiter(this.done),
      this.value ? this.inactive : color.cyan().underline(this.inactive),
      color.gray('/'),
      this.value ? color.cyan().underline(this.active) : this.active,
    ].join(' ');

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }
}

export interface TogglePromptProps extends BaseProps {
  /**
   * Prompt message to display.
   */
  message: string;

  /**
   * The initial value of the prompt.
   *
   * @default false
   */
  initial?: boolean;

  /**
   * Receive user input. The returned value will be added to the response object
   */
  format?: FormatFunction<boolean>;

  /**
   * Text for active state.
   *
   * @default 'on'
   */
  active?: string;

  /**
   * Text for inactive state.
   *
   * @default 'off'
   */
  inactive?: string;
}

export type FormatFunction<Value = unknown> = (input: Value) => Value;
