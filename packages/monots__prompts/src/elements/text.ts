import color from 'picocolors';
import { cursor, erase } from 'sisteransi';

import { type Action, type UnknownAction, clear, figures, lines, style } from '../utils/index.js';
import { type PromptProps, Prompt } from './prompt.js';

/**
 * TextPrompt Base Element
 */
export class TextPrompt extends Prompt<string> {
  #value = '';

  transform: { scale: number; render: (input: string) => string };
  scale: number;
  message: string;
  initial: string;
  validator: TextValidateFunction;
  errorMessage: string;
  cursor: number;
  cursorOffset: number;
  clear: string;
  placeholder: boolean;
  rendered = '';
  done = false;
  error = false;
  red = false;
  outputError = '';
  outputText = '';

  override set value(value) {
    if (!value && this.initial) {
      this.placeholder = true;
      this.rendered = color.gray(this.transform.render(this.initial));
    } else {
      this.placeholder = false;
      this.rendered = this.transform.render(value);
    }

    this.#value = value;
    this.fire();
  }

  override get value() {
    return this.#value;
  }

  /**
   * @param props Options
   */
  constructor(props: TextPromptProps) {
    const {
      message,
      error,
      initial,
      onRender,
      stdin,
      stdout,
      style: type = 'default',
      validate,
    } = props;
    super({ onRender, stdin, stdout });
    this.transform = style.render(type);
    this.scale = this.transform.scale;
    this.message = message;
    this.initial = initial || ``;
    this.validator = validate || (() => true);
    this.value = ``;
    this.errorMessage = error || `Please Enter A Valid Value`;
    this.cursor = Number(!!this.initial);
    this.cursorOffset = 0;
    this.clear = clear(``, this.out.columns);
    this.placeholder = !!(!this.#value && this.initial);
    this.render();
  }

  override readonly reset = () => {
    this.value = ``;
    this.cursor = Number(!!this.initial);
    this.cursorOffset = 0;
    this.fire();
    this.render();
  };

  override readonly exit = () => {
    this.abort();
  };

  override readonly abort = () => {
    this.value = this.value || this.initial;
    this.done = this.aborted = true;
    this.error = false;
    this.red = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  };

  async validate() {
    let valid = await this.validator(this.value);

    if (typeof valid === `string`) {
      this.errorMessage = valid;
      valid = false;
    }

    this.error = !valid;
  }

  override readonly submit = async () => {
    this.value = this.value || this.initial;
    this.cursorOffset = 0;
    this.cursor = this.rendered.length;
    await this.validate();

    if (this.error) {
      this.red = true;
      this.fire();
      this.render();
      return;
    }

    this.done = true;
    this.aborted = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  };

  override readonly next = () => {
    if (!this.placeholder) {
      return this.invalid();
    }

    this.value = this.initial;
    this.cursor = this.rendered.length;
    this.fire();
    this.render();
  };

  moveCursor(steps: number) {
    if (this.placeholder) {
      return;
    }

    this.cursor = this.cursor + steps;
    this.cursorOffset += steps;
  }

  override readonly unknown: UnknownAction = (char) => {
    const beforeCursor = this.value.slice(0, this.cursor);
    const afterCursor = this.value.slice(this.cursor);
    this.value = `${beforeCursor}${char}${afterCursor}`;
    this.red = false;
    this.cursor = this.placeholder ? 0 : beforeCursor.length + 1;
    this.render();
  };

  override readonly delete: Action = () => {
    if (this.isCursorAtStart()) {
      return this.invalid();
    }

    const s1 = this.value.slice(0, this.cursor - 1);
    const s2 = this.value.slice(this.cursor);
    this.value = `${s1}${s2}`;
    this.red = false;

    if (this.isCursorAtStart()) {
      this.cursorOffset = 0;
    } else {
      this.cursorOffset++;
      this.moveCursor(-1);
    }

    this.render();
  };

  override readonly deleteForward: Action = () => {
    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) {
      return this.invalid();
    }

    const s1 = this.value.slice(0, this.cursor);
    const s2 = this.value.slice(this.cursor + 1);
    this.value = `${s1}${s2}`;
    this.red = false;

    if (this.isCursorAtEnd()) {
      this.cursorOffset = 0;
    } else {
      this.cursorOffset++;
    }

    this.render();
  };

  override readonly first: Action = () => {
    this.cursor = 0;
    this.render();
  };

  override readonly last: Action = () => {
    this.cursor = this.value.length;
    this.render();
  };

  override readonly left: Action = () => {
    if (this.cursor <= 0 || this.placeholder) {
      return this.invalid();
    }

    this.moveCursor(-1);
    this.render();
  };

  override readonly right: Action = () => {
    if (this.cursor * this.scale >= this.rendered.length || this.placeholder) {
      return this.invalid();
    }

    this.moveCursor(1);
    this.render();
  };

  isCursorAtStart() {
    return this.cursor === 0 || (this.placeholder && this.cursor === 1);
  }

  isCursorAtEnd() {
    return (
      this.cursor === this.rendered.length ||
      (this.placeholder && this.cursor === this.rendered.length + 1)
    );
  }

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

    this.outputText = [
      style.symbol(this.done, this.aborted),
      color.bold(this.message),
      style.delimiter(this.done),
      this.red ? color.red(this.rendered) : this.rendered,
    ].join(` `);

    if (this.error) {
      this.outputError += this.errorMessage
        .split(`\n`)
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce(
          (accumulated, line, index) =>
            `${accumulated}\n${index ? ' ' : figures.pointerSmall} ${color.red(
              color.italic(line),
            )}`,
          ``,
        );
    }

    this.out.write(
      erase.line +
        cursor.to(0) +
        this.outputText +
        cursor.save +
        this.outputError +
        cursor.restore +
        cursor.move(this.cursorOffset, 0),
    );
  }
}

export interface TextPromptProps extends PromptProps {
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
  initial?: string;

  /**
   * Function to validate user input
   */
  validate?: TextValidateFunction;

  /**
   * The invalid error label
   */
  error?: string;
}

export type TextValidateFunction = (input: string) => boolean | Promise<boolean>;
