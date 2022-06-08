import type { Readable, Writable } from 'node:stream';
import type picocolors from 'picocolors';
import type { Prompt } from './elements/prompt.js';

export interface Choice {
  title: string;
  value?: any;
  disabled?: boolean;
  selected?: boolean;
  description?: string;
}

export interface Options<Key extends string = string> {
  /**
   * Callback that's invoked after each prompt submission. Its signature is
   * (prompt, answer, answers) where prompt is the current prompt object, answer
   * the user answer to the current question and answers the user answers so
   * far. Async functions are supported.
   *
   * Return true to quit the prompt chain and return all collected responses so
   * far, otherwise continue to iterate prompt objects.
   *
   * ### Example
   *
   * ```ts
   * const questions = [{ ... }];
   * const onSubmit = (prompt, answer) =>  {
   *   console.log(`Thanks I got ${answer} from ${prompt.name}`);
   * };
   * const response = await prompts(questions, { onSubmit });
   * ```
   */
  onSubmit?: (prompt: Question, answer: any, answers: Answers<Key>) => void;

  /**
   * Callback that's invoked when the user cancels/exits the prompt. Its
   * signature is (prompt, answers) where prompt is the current prompt object
   * and answers the user answers so far. Async functions are supported.
   *
   * Return true to continue and prevent the prompt loop from aborting. On
   * cancel responses collected so far are returned.
   *
   * ### Example
   *
   * ```ts
   * const questions = [{ ... }];
   * const onCancel = prompt => {
   *   console.log('Never stop prompting!');
   *   return true;
   * }
   * const response = await prompts(questions, { onCancel });
   * ```
   */
  onCancel?: (prompt: Question, answers: any) => void;
}

export type MaybePromise<Type> = Promise<Type> | Type;
type MaybeFunction<Answers extends DefaultAnswers = DefaultAnswers, Returns = keyof Answers> =
  | Returns
  | DynamicPromptFunction<Answers, Returns>;

/**
 * @param previous the previous value
 */
type DynamicPromptFunction<
  Answers extends DefaultAnswers = DefaultAnswers,
  Returns = keyof Answers,
> = (previous: any, values: Answers, previousQuestion: Question) => Returns;

/**
 * Each property be of type function and will be invoked right before prompting
 * the user.
 *
 * The function signature is (prev, values, prompt), where prev is the value
 * from the previous prompt, values is the response object with all values
 * collected so far and prompt is the previous prompt object.
 *
 * Function example:
 *
 * ```ts
 * {
 *   type: prev => prev > 3 ? 'confirm' : null,
 *   name: 'confirm',
 *   message: (prev, values) => `Please confirm that you eat ${values.dish} times ${prev} a day?`
 * }
 * ```
 *
 * The above prompt will be skipped if the value of the previous prompt is less
 * than 3.
 */
export interface BasePrompt<Answers extends DefaultAnswers = DefaultAnswers> extends BaseProps {
  /**
   * The response will be saved under this key/property in the returned response
   * object. In case you have multiple prompts with the same name only the
   * latest response will be stored.
   *
   * > Make sure to give prompts unique names if you don't want to overwrite
   * previous values.
   */
  name: MaybeFunction<Answers>;

  /**
   * The message to be displayed to the user.
   */
  message?: MaybeFunction<Answers, string>;

  /**
   * Optional default prompt value. Async functions are supported too.
   */
  initial?: DynamicPromptFunction<Answers, MaybePromise<InitialReturnValue>>;

  /**
   * Receive the user input and return the formatted value to be used inside the
   * program. The value returned will be added to the response object.
   *
   * The function signature is (val, values), where val is the value from the
   * current prompt and values is the current response object in case you need
   * to format based on previous responses.
   *
   * ### Example
   *
   * ```ts
   * {
   *   type: 'number',
   *   name: 'price',
   *   message: 'Enter price',
   *   format: val => Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(val);
   * }
   * ```
   */
  validate?: (value: any, values: Answers) => MaybePromise<string | Error | boolean>;
}

export interface BaseProps {
  /**
   * Callback for when the prompt is rendered. The function receives picocolors
   * as its first argument and this refers to the current prompt.
   *
   * ### Example
   *
   * ```ts
   * {
   *   type: 'number',
   *   message: 'This message will be overridden',
   *   onRender(pico) {
   *     this.msg = kleur.cyan('Enter a number');
   *   }
   * }
   * ```
   */
  onRender?: (this: Prompt, colors: typeof picocolors) => void;

  /**
   * Callback for when the state of the current prompt changes. The function
   * signature is (state) where state is an object with a snapshot of the
   * current state. The state object has two properties value and aborted. E.g
   * `{ value: 'This is ', aborted: false }`
   */
  onState?: (state: PromptState) => void;

  /**
   * By default, prompts uses process.stdin for receiving input and
   * process.stdout for writing output. If you need to use different streams,
   * for instance process.stderr, you can set these with the stdin and stdout
   * properties.
   */
  stdout?: NodeJS.WriteStream;

  /**
   * By default, prompts uses `process.stdin` for receiving input and
   * process.stdout for writing output. If you need to use different streams,
   * for instance process.stderr, you can set these with the stdin and stdout
   * properties.
   */
  stdin?: NodeJS.ReadStream;
}

export interface TypedBasePrompt<Answers extends DefaultAnswers = DefaultAnswers> {
  /**
   * Defines the type of prompt to display. See the list of prompt types for
   * valid values.
   *
   * If type is a falsy value the prompter will skip that question.
   *
   * ```ts
   * {
   *   type: null, // or false
   *   name: 'forgetme',
   *   message: `I'll never be shown anyway`,
   * }
   * ```
   */
  type: string | DynamicPromptFunction<Answers, PromptType | Falsy> | Falsy;
}

export interface PromptState {
  /**
   * The current value of the prompt.
   */
  value: unknown;

  /**
   * True when the prompt has been aborted.
   */
  aborted: boolean;

  /**
   * `true` when the prompt is exited.
   */
  exited: boolean;
}

export interface Question<Key extends string = string> {
  type: PromptType | Falsy | PrevCaller<Key, PromptType | Falsy>;
  name: ValueOrFunc<Key>;
  message?: ValueOrFunc<string>;
  initial?: InitialReturnValue | PrevCaller<Key, InitialReturnValue | Promise<InitialReturnValue>>;
  style?: string | PrevCaller<Key, string | Falsy>;
  format?: PrevCaller<Key, void>;
  validate?: (value: any, values: Answers<Key>) => MaybePromise<string | Error | boolean>;
  onState?: PrevCaller<Key, void>;
  min?: number | PrevCaller<Key, number | Falsy>;
  max?: number | PrevCaller<Key, number | Falsy>;
  float?: boolean | PrevCaller<Key, boolean | Falsy>;
  round?: number | PrevCaller<Key, number | Falsy>;
  instructions?: string | boolean;
  increment?: number | PrevCaller<Key, number | Falsy>;
  separator?: string | PrevCaller<Key, string | Falsy>;
  active?: string | PrevCaller<Key, string | Falsy>;
  inactive?: string | PrevCaller<Key, string | Falsy>;
  choices?: Choice[] | PrevCaller<Key, Choice[] | Falsy>;
  hint?: string | PrevCaller<Key, string | Falsy>;
  warn?: string | PrevCaller<Key, string | Falsy>;
  suggest?: (input: any, choices: Choice[]) => Promise<any>;
  limit?: number | PrevCaller<Key, number | Falsy>;
  mask?: string | PrevCaller<Key, string | Falsy>;
  stdout?: Writable;
  stdin?: Readable;
}

export type Answers<T extends string> = { [id in T]: any };
interface DefaultAnswers {
  [key: string]: any;
}

export type PrevCaller<T extends string, R = T> = (
  prev: any,
  values: Answers<T>,
  prompt: Question,
) => R;

export type Falsy = false | null | undefined;

export type PromptType =
  | 'text'
  | 'password'
  | 'invisible'
  | 'number'
  | 'confirm'
  | 'list'
  | 'toggle'
  | 'select'
  | 'multiselect'
  | 'autocomplete'
  | 'date'
  | 'autocompleteMultiselect';

export type ValueOrFunc<T extends string> = T | PrevCaller<T>;

export type InitialReturnValue = string | number | boolean | Date;
