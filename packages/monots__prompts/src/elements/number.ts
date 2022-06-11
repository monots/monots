import pico from 'picocolors';
import { cursor, erase } from 'sisteransi';

import type { MaybePromise } from '../types.js';
import type { Action, UnknownAction } from '../utils';
import { clear, figures, lines, style } from '../utils';
import type { PromptProps } from './prompt';
import { Prompt } from './prompt';

const isNumber = /\d/;
const isDefined = <Type>(value: Type): value is NonNullable<Type> => value !== undefined;
const round = (number: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
};

/**
 * NumberPrompt Base Element
 */
export class NumberPrompt extends Prompt<number | string> {
  #value: number | string = '';
  transform: { scale: number; render: (input: string) => string };
  message: string;
  initial: string | number;
  float: boolean;
  round: number;
  inc: number;
  min: number;
  max: number;
  errorMessage: string;
  validator: NumberValidateFunction;
  color: Color;
  typed: string;
  lastHit: number;
  placeholder = true;
  rendered: string;
  done = false;
  error = false;
  outputError = '';
  outputText = '';

  /**
   * @param props Options
   */
  constructor(props: NumberPromptOptions) {
    super(props);
    this.transform = style.render(props.style ?? 'default');
    this.message = props.message;
    this.initial = isDefined(props.initial) ? props.initial : '';
    this.float = !!props.float;
    this.round = props.round || 2;
    this.inc = props.increment || 1;
    this.min = isDefined(props.min) ? props.min : Number.NEGATIVE_INFINITY;
    this.max = isDefined(props.max) ? props.max : Number.POSITIVE_INFINITY;
    this.errorMessage = props.error || `Please Enter A Valid Value`;
    this.validator = props.validate || (() => true);
    this.color = 'cyan';
    this.placeholder = true;
    this.rendered = this.transform.render(`${this.initial}`);
    this.value = '';
    this.typed = '';
    this.lastHit = 0;
    this.render();
  }

  set value(value) {
    if (typeof value !== 'number') {
      this.placeholder = true;
      this.rendered = pico.gray(this.transform.render(`${this.initial}`));
      this.#value = '';
    } else {
      this.placeholder = false;
      this.rendered = this.transform.render(`${round(value, this.round)}`);
      this.#value = round(value, this.round);
    }

    this.fire();
  }

  get value() {
    return this.#value;
  }

  parse(x: number | string) {
    return this.float ? Number.parseFloat(`${x}`) : Number.parseInt(`${x}`);
  }

  valid(char: string) {
    return char === `-` || (char === `.` && this.float) || isNumber.test(char);
  }

  override readonly reset: Action = () => {
    this.typed = '';
    this.value = '';
    this.fire();
    this.render();
  };

  override readonly exit: Action = (key) => {
    this.abort(key);
  };

  override readonly abort: Action = () => {
    const x = this.value;
    this.value = x !== '' ? x : this.initial;
    this.done = this.aborted = true;
    this.error = false;
    this.fire();
    this.render();
    this.out.write(`\n`);
    this.close();
  };

  async validate() {
    let valid = await this.validator(this.value as number);

    if (typeof valid === `string`) {
      this.errorMessage = valid;
      valid = false;
    }

    this.error = !valid;
  }

  override readonly submit: Action = async () => {
    await this.validate();

    if (this.error) {
      this.color = `red`;
      this.fire();
      this.render();
      return;
    }

    const x = this.value;
    this.value = x !== '' ? x : this.initial;
    this.done = true;
    this.aborted = false;
    this.error = false;
    this.fire();
    this.render();
    this.out.write(`\n`);
    this.close();
  };

  override readonly up: Action = () => {
    this.typed = '';

    if (typeof this.value === 'string') {
      this.value = this.min - this.inc;
    }

    if (this.value >= this.max) {
      return this.invalid();
    }

    this.value = typeof this.value === 'string' ? this.inc : this.value + this.inc;
    this.color = `cyan`;
    this.fire();
    this.render();
  };

  override readonly down: Action = () => {
    this.typed = '';

    if (typeof this.value === 'string') {
      this.value = this.min + this.inc;
    }

    if (this.value <= this.min) {
      return this.invalid();
    }

    this.value = typeof this.value === 'string' ? -this.inc : this.value - this.inc;
    this.color = `cyan`;
    this.fire();
    this.render();
  };

  override readonly delete: Action = () => {
    let val = this.value.toString();

    if (val.length === 0) {
      return this.invalid();
    }

    this.value = this.parse((val = val.slice(0, -1))) || '';

    if (this.value !== '' && this.value < this.min) {
      this.value = this.min;
    }

    this.color = `cyan`;
    this.fire();
    this.render();
  };

  override readonly next: Action = () => {
    this.value = this.initial;
    this.fire();
    this.render();
  };

  override readonly unknown?: UnknownAction = (char) => {
    if (!this.valid(char)) {
      return this.invalid();
    }

    const now = Date.now();

    if (now - this.lastHit > 1000) {
      this.typed = '';
    } // 1s elapsed

    this.typed += char;
    this.lastHit = now;
    this.color = `cyan`;

    if (char === `.`) {
      return this.fire();
    }

    this.value = Math.min(this.parse(this.typed), this.max);

    if (this.value > this.max) {
      this.value = this.max;
    }

    if (this.value < this.min) {
      this.value = this.min;
    }

    this.fire();
    this.render();
  };

  override render() {
    if (this.closed) {
      return;
    }

    if (!this.firstRender) {
      if (this.outputError) {
        this.out.write(
          cursor.down(lines(this.outputError, this.out.columns) - 1) +
            clear(this.outputError, this.out.columns),
        );
      }

      this.out.write(clear(this.outputText, this.out.columns));
    }

    super.render();
    this.outputError = '';

    // Print prompt
    this.outputText = [
      style.symbol(this.done, this.aborted),
      pico.bold(this.message),
      style.delimiter(this.done),
      !this.done || (!this.done && !this.placeholder)
        ? pico[this.color](pico.underline(this.rendered))
        : this.rendered,
    ].join(` `);

    // Print error
    if (this.error) {
      this.outputError += this.errorMessage
        .split('\n')
        .reduce(
          (accumulated, line, index) =>
            `${accumulated}\n${index ? ` ` : figures.pointerSmall} ${pico.red(pico.italic(line))}`,
          '',
        );
    }

    this.out.write(
      erase.line + cursor.to(0) + this.outputText + cursor.save + this.outputError + cursor.restore,
    );
  }
}

export interface NumberPromptOptions extends PromptProps {
  /**
   * Prompt message to display
   */
  message: string;

  /**
   * Render style
   * @default "default"
   */
  style?: 'default' | 'password' | 'invisible';

  /**
   * Default value
   */
  initial?: number;

  /**
   * Max value
   * @default Infinity
   */
  max?: number;

  /**
   * Min value
   * @default -Infinity
   */
  min?: number;

  /**
   * Parse input as floats
   * @default false
   */
  float?: boolean;

  /**
   * Round floats to x decimals
   * @default 2
   */
  round?: number;

  /**
   * Number to increment by when using arrow-keys
   * @default 1
   */
  increment?: number;

  /**
   * Function to validate user input
   */
  validate?: NumberValidateFunction;

  /**
   * The invalid error label
   */
  error?: string;
}

export type NumberValidateFunction = (input: number) => MaybePromise<boolean>;

type Color =
  | 'reset'
  | 'bold'
  | 'dim'
  | 'italic'
  | 'underline'
  | 'inverse'
  | 'hidden'
  | 'strikethrough'
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'bgBlack'
  | 'bgRed'
  | 'bgGreen'
  | 'bgYellow'
  | 'bgBlue'
  | 'bgMagenta'
  | 'bgCyan'
  | 'bgWhite';
