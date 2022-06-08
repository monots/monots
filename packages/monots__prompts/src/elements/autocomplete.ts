import color from 'picocolors';
import { cursor, erase } from 'sisteransi';

import { clear, entriesToDisplay, figures, style, wrap } from '../utils';
import type { PromptProps } from './prompt';
import { Prompt } from './prompt';

const getVal = (arr: any[], i: number) => arr[i] && (arr[i].value || arr[i].title || arr[i]);
const getTitle = (arr: any[], i: number) => arr[i] && (arr[i].title || arr[i].value || arr[i]);
const getIndex = (arr: any[], valOrTitle) => {
  const index = arr.findIndex((el) => el.value === valOrTitle || el.title === valOrTitle);
  return index > -1 ? index : undefined;
};

/**
 * AutocompletePrompt Base Element
 */
export class AutocompletePrompt extends Prompt {
  msg: string;
  suggest: SuggestFunction;
  choices: Choice[];
  initial: number;
  select: number;
  i18n: { noMatches: string };
  clearFirst: boolean;
  suggestions: any[];
  input: string;
  limit: number;
  cursor: number;
  transform: { scale: number; render: (input: string) => string };
  scale: number;
  clear: string;
  private _fb: any;
  completing: any;
  done: boolean;
  rendered: any;
  outputText: string;

  /**
   * @param opts Options
   */
  constructor(opts?: AutocompletePromptOptions) {
    opts ??= {} as AutocompletePromptOptions;
    super(opts);
    this.msg = opts.message;
    this.suggest = opts.suggest;
    this.choices = opts.choices;
    this.initial =
      typeof opts.initial === 'number' ? opts.initial : getIndex(opts.choices, opts.initial);
    this.select = this.initial || opts.cursor || 0;
    this.i18n = { noMatches: opts.noMatches || 'no matches found' };
    this.fallback = opts.fallback || this.initial;
    this.clearFirst = opts.clearFirst || false;
    this.suggestions = [];
    this.input = '';
    this.limit = opts.limit || 10;
    this.cursor = 0;
    this.transform = style.render(opts.style);
    this.scale = this.transform.scale;
    this.render = this.render.bind(this);
    this.complete = this.complete.bind(this);
    this.clear = clear('', this.out.columns);
    this.complete(this.render);
    this.render();
  }

  set fallback(fb) {
    this._fb = Number.isSafeInteger(Number.parseInt(fb)) ? Number.parseInt(fb) : fb;
  }

  get fallback() {
    let choice;

    if (typeof this._fb === 'number') {
      choice = this.choices[this._fb];
    } else if (typeof this._fb === 'string') {
      choice = { title: this._fb };
    }

    return choice || this._fb || { title: this.i18n.noMatches };
  }

  moveSelect(i) {
    this.select = i;

    this.value = this.suggestions.length > 0 ? getVal(this.suggestions, i) : this.fallback.value;
    this.fire();
  }

  async complete(cb) {
    const p = (this.completing = this.suggest(this.input, this.choices));
    const suggestions = await p;

    if (this.completing !== p) {
      return;
    }

    this.suggestions = suggestions.map((s, i, arr) => ({
      title: getTitle(arr, i),
      value: getVal(arr, i),
      description: s.description,
    }));
    this.completing = false;
    const l = Math.max(suggestions.length - 1, 0);
    this.moveSelect(Math.min(l, this.select));

    cb && cb();
  }

  reset() {
    this.input = '';
    this.complete(() => {
      this.moveSelect(this.initial !== void 0 ? this.initial : 0);
      this.render();
    });
    this.render();
  }

  exit() {
    if (this.clearFirst && this.input.length > 0) {
      this.reset();
    } else {
      this.done = this.exited = true;
      this.aborted = false;
      this.fire();
      this.render();
      this.out.write('\n');
      this.close();
    }
  }

  abort() {
    this.done = this.aborted = true;
    this.exited = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  submit() {
    this.done = true;
    this.aborted = this.exited = false;
    this.fire();
    this.render();
    this.out.write('\n');
    this.close();
  }

  _(c, key) {
    const s1 = this.input.slice(0, this.cursor);
    const s2 = this.input.slice(this.cursor);
    this.input = `${s1}${c}${s2}`;
    this.cursor = s1.length + 1;
    this.complete(this.render);
    this.render();
  }

  delete() {
    if (this.cursor === 0) {
      return this.invalid();
    }

    const s1 = this.input.slice(0, this.cursor - 1);
    const s2 = this.input.slice(this.cursor);
    this.input = `${s1}${s2}`;
    this.complete(this.render);
    this.cursor = this.cursor - 1;
    this.render();
  }

  deleteForward() {
    if (this.cursor * this.scale >= this.rendered.length) {
      return this.invalid();
    }

    const s1 = this.input.slice(0, this.cursor);
    const s2 = this.input.slice(this.cursor + 1);
    this.input = `${s1}${s2}`;
    this.complete(this.render);
    this.render();
  }

  first() {
    this.moveSelect(0);
    this.render();
  }

  last() {
    this.moveSelect(this.suggestions.length - 1);
    this.render();
  }

  up() {
    if (this.select === 0) {
      this.moveSelect(this.suggestions.length - 1);
    } else {
      this.moveSelect(this.select - 1);
    }

    this.render();
  }

  down() {
    if (this.select === this.suggestions.length - 1) {
      this.moveSelect(0);
    } else {
      this.moveSelect(this.select + 1);
    }

    this.render();
  }

  next() {
    if (this.select === this.suggestions.length - 1) {
      this.moveSelect(0);
    } else {
      this.moveSelect(this.select + 1);
    }

    this.render();
  }

  nextPage() {
    this.moveSelect(Math.min(this.select + this.limit, this.suggestions.length - 1));
    this.render();
  }

  prevPage() {
    this.moveSelect(Math.max(this.select - this.limit, 0));
    this.render();
  }

  left() {
    if (this.cursor <= 0) {
      return this.invalid();
    }

    this.cursor = this.cursor - 1;
    this.render();
  }

  right() {
    if (this.cursor * this.scale >= this.rendered.length) {
      return this.invalid();
    }

    this.cursor = this.cursor + 1;
    this.render();
  }

  renderOption(v, hovered, isStart, isEnd) {
    let desc: string;
    let prefix = isStart ? figures.arrowUp : isEnd ? figures.arrowDown : ' ';
    const title = hovered ? color.cyan().underline(v.title) : v.title;
    prefix = (hovered ? `${color.cyan(figures.pointer)} ` : '  ') + prefix;

    if (v.description) {
      desc = ` - ${v.description}`;

      if (
        prefix.length + title.length + desc.length >= this.out.columns ||
        v.description.split(/\r?\n/).length > 1
      ) {
        desc = `\n${wrap(v.description, { margin: 3, width: this.out.columns })}`;
      }
    }

    return `${prefix} ${title}${color.gray(desc || '')}`;
  }

  render() {
    if (this.closed) {
      return;
    }

    if (this.firstRender) {
      this.out.write(cursor.hide);
    } else {
      this.out.write(clear(this.outputText, this.out.columns));
    }

    super.render();

    const { startIndex, endIndex } = entriesToDisplay(this.select, this.choices.length, this.limit);

    this.outputText = [
      style.symbol(this.done, this.aborted, this.exited),
      color.bold(this.msg),
      style.delimiter(this.completing),
      this.done && this.suggestions[this.select]
        ? this.suggestions[this.select].title
        : (this.rendered = this.transform.render(this.input)),
    ].join(' ');

    if (!this.done) {
      const suggestions = this.suggestions
        .slice(startIndex, endIndex)
        .map((item, i) =>
          this.renderOption(
            item,
            this.select === i + startIndex,
            i === 0 && startIndex > 0,
            i + startIndex === endIndex - 1 && endIndex < this.choices.length,
          ),
        )
        .join('\n');
      this.outputText += `\n${suggestions || color.gray(this.fallback.title)}`;
    }

    this.out.write(erase.line + cursor.to(0) + this.outputText);
  }
}

export interface AutocompletePromptOptions extends PromptProps {
  /**
   * Prompt message to display
   */
  message: string;

  /**
   * Array of auto-complete choices objects
   */
  choices: Choice[];

  /**
   * Function to filter results based on user input. Defaults to sort by `title`
   */
  suggest: SuggestFunction;

  /**
   * Max number of results to show
   * @default 10
   */
  limit?: number;

  /**
   * Cursor start position
   * @default 0
   */
  cursor?: number;

  /**
   * Render style
   * @default "default"
   */
  style?: 'default' | 'password' | 'invisible';

  /**
   * Fallback message
   * @default AutocompletePromptOptions.initial
   */
  fallback?: string;

  /**
   * Index of the default value
   */
  initial?: number;

  /**
   * The first ESCAPE keypress will clear the input
   * @default false
   */
  clearFirst?: boolean;

  /**
   * The no matches found label
   * @default "no matches found"
   */
  noMatches?: string;
}

export interface Choice {
  title: string;
  value: any;
  disable?: boolean;
}

export type SuggestFunction = (input: string, choices: Choice[]) => Promise<any>;
