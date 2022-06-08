import type { SuggestFunction } from './elements';
import * as elements from './elements';

const noop = (v: any): any => v;

function toPrompt(
  type: keyof typeof elements,
  args: TextOptions | NumberOptions | AutocompleteOptions,
  options: ToPromptOptions = {},
) {
  return new Promise((res, rej) => {
    const p = new elements[type](args);
    const onAbort = options.onAbort || noop;
    const onSubmit = options.onSubmit || noop;
    const onExit = options.onExit || noop;
    p.on('state', args.onState || noop);
    p.on('submit', (x) => res(onSubmit(x)));
    p.on('exit', (x) => res(onExit(x)));
    p.on('abort', (x) => rej(onAbort(x)));
  });
}

interface ToPromptOptions {
  onAbort?: (items: any) => any;
  onSubmit?: (items: any) => any;
  onExit?: (items: any) => any;
}

interface BaseFunctionOptions {
  onState?: (state: any) => any;
}

/**
 * Text prompt
 * @param args The arguments for the prompt
 * @returns Promise with user input
 */
export function text(args: TextOptions): Promise<string> {
  return toPrompt('TextPrompt', args) as Promise<string>;
}

export type TextOptions = BaseFunctionOptions & elements.TextPromptProps;

/**
 * Password prompt with masked input
 * @param args The arguments for the prompt
 * @returns Promise with user input
 */
export function password(args: Omit<TextOptions, 'style'>): Promise<string> {
  (args as TextOptions).style = 'password';
  return text(args);
}

/**
 * Prompt where input is invisible, like sudo
 * @param args The arguments for the prompt
 * @returns Promise with user input
 */
export function invisible(args: Omit<TextOptions, 'style'>): Promise<string> {
  (args as TextOptions).style = 'invisible';
  return text(args);
}

/**
 * Number prompt
 * @param args The arguments for the prompt
 * @returns Promise with user input
 */
export function number(args: NumberOptions): Promise<number> {
  return toPrompt('NumberPrompt', args) as Promise<number>;
}

export type NumberOptions = BaseFunctionOptions & elements.NumberValidateFunction;

/**
 * Date prompt
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {number} args.initial Default number value
 * @param {function} [args.onState] On state change callback
 * @param {number} [args.max] Max value
 * @param {number} [args.min] Min value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {Boolean} [opts.float=false] Parse input as floats
 * @param {Number} [opts.round=2] Round floats to x decimals
 * @param {Number} [opts.increment=1] Number to increment by when using arrow-keys
 * @param {function} [args.validate] Function to validate user input
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
export function date(args) {
  return toPrompt('DatePrompt', args);
}

/**
 * Classic yes/no prompt
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
export function confirm(args) {
  return toPrompt('ConfirmPrompt', args);
}

/**
 * List prompt, split intput string by `seperator`
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {string} [args.initial] Default string value
 * @param {string} [args.style="default"] Render style ('default', 'password', 'invisible')
 * @param {string} [args.separator] String separator
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input, in form of an `Array`
 */
export function list(args) {
  const sep = args.separator || ',';
  return toPrompt('TextPrompt', args, {
    onSubmit: (str: string) => str.split(sep).map((s) => s.trim()),
  });
}

/**
 * Toggle/switch prompt
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {boolean} [args.initial=false] Default value
 * @param {string} [args.active="on"] Text for `active` state
 * @param {string} [args.inactive="off"] Text for `inactive` state
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
export function toggle(args) {
  return toPrompt('TogglePrompt', args);
}

/**
 * Interactive select prompt
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value }, ...]`
 * @param {number} [args.initial] Index of default value
 * @param {String} [args.hint] Hint to display
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
export function select(args) {
  return toPrompt('SelectPrompt', args);
}

/**
 * Interactive multi-select prompt
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
 * @param {number} [args.max] Max select
 * @param {string} [args.hint] Hint to display user
 * @param {Number} [args.cursor=0] Cursor start position
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
export function multiselect(args) {
  args.choices = [args.choices || []].flat();
  const toSelected = (items) => items.filter((item) => item.selected).map((item) => item.value);
  return toPrompt('MultiselectPrompt', args, {
    onAbort: toSelected,
    onSubmit: toSelected,
  });
}

/**
 * Interactive autocompleteMultiselect prompt
 * @param args The arguments for the prompt
 * @param {string} args.message Prompt message to display
 * @param {Array} args.choices Array of choices objects `[{ title, value, [selected] }, ...]`
 * @param {number} [args.max] Max select
 * @param {string} [args.hint] Hint to display user
 * @param {Number} [args.cursor=0] Cursor start position
 * @param {function} [args.onState] On state change callback
 * @param {Stream} [args.stdin] The Readable stream to listen to
 * @param {Stream} [args.stdout] The Writable stream to write readline data to
 * @returns {Promise} Promise with user input
 */
export function autocompleteMultiselect(args) {
  args.choices = [args.choices || []].flat();
  const toSelected = (items) => items.filter((item) => item.selected).map((item) => item.value);
  return toPrompt('AutocompleteMultiselectPrompt', args, {
    onAbort: toSelected,
    onSubmit: toSelected,
  });
}

function byTitle(input, choices) {
  return Promise.resolve(
    choices.filter(
      (item) => item.title.slice(0, input.length).toLowerCase() === input.toLowerCase(),
    ),
  );
}

/**
 * Interactive auto-complete prompt
 * @returns Promise with user input
 */
export function autocomplete(args: AutocompleteOptions): Promise<any> {
  args.suggest = args.suggest || byTitle;
  args.choices = [args.choices || []].flat();
  return toPrompt('AutocompletePrompt', args);
}

export type AutocompleteOptions = elements.AutocompletePromptOptions &
  BaseFunctionOptions & {
    /**
     * Function to filter results based on user input. Defaults to sort by `title`
     */
    suggest?: SuggestFunction;
  };
