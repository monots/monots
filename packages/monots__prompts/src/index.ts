import * as prompts from './prompts.js';
import type { Answers, Options, Question } from './types.js';

const passOn = new Set(['suggest', 'format', 'onState', 'validate', 'onRender', 'type']);
let _override: Record<string, unknown> = {};
let _injected: Array<Record<string, unknown>> = [];

/**
 * Prompt for a series of questions
 * @param questions single question object or Array of question objects
 * @param options callback functions for submit and on cancel/abort
 * @returns object with values from user input
 */
export async function prompt<Type extends string = string>(
  questions: Question | Question[] = [],
  options: Options = {},
): Promise<Answers<Type>> {
  const answers = {};
  questions = [questions].flat();
  let answer, question, quit, name, type, lastPrompt;

  const getFormattedAnswer = async (
    question: Question,
    answer: unknown,
    skipValidation = false,
  ) => {
    if (!skipValidation && question.validate?.(answer, answers, question) !== true) {
      return;
    }

    const result = (await question.format?.(answer, answers, question)) ?? answer;
    return result;
  };

  for (question of questions) {
    ({ name, type } = question);

    // evaluate type first and skip if type is a falsy value
    if (typeof type === 'function') {
      type = await type(answer, { ...answers }, question);
      question['type'] = type;
    }

    if (!type) {
      continue;
    }

    // if property is a function, invoke it unless it's a special function
    for (const key in question) {
      if (passOn.has(key)) {
        continue;
      }

      const value = question[key];
      question[key] =
        typeof value === 'function' ? await value(answer, { ...answers }, lastPrompt) : value;
    }

    lastPrompt = question;

    if (typeof question.message !== 'string') {
      throw new TypeError('prompt message is required');
    }

    // update vars in case they changed
    ({ name, type } = question);

    if (prompts[type] === void 0) {
      throw new Error(`prompt type (${type}) is not defined`);
    }

    if (_override[question.name] !== undefined) {
      answer = await getFormattedAnswer(question, _override[question.name]);

      if (answer !== undefined) {
        answers[name] = answer;
        continue;
      }
    }

    try {
      // Get the injected answer if there is one or prompt the user
      answer = prompt._injected
        ? getInjectedAnswer(prompt._injected, question.initial)
        : await prompts[type](question);
      answers[name] = answer = await getFormattedAnswer(question, answer, true);
      quit = await onSubmit(question, answer, answers);
    } catch {
      quit = !(await onCancel(question, answers));
    }

    if (quit) {
      return answers;
    }
  }

  return answers;
}

function getInjectedAnswer(injected, deafultValue) {
  const answer = injected.shift();

  if (answer instanceof Error) {
    throw answer;
  }

  return answer === undefined ? deafultValue : answer;
}

/**
 * For testing purposes only.
 *
 * @internal
 */
export function inject<Answers extends Record<string, unknown> = Record<string, any>>(
  answers: Answers[],
) {
  _injected = [...(_injected ?? []), ...answers];
}

export function override<Answers extends Record<string, unknown> = Record<string, any>>(
  answers: Answers,
) {
  _override = { ...answers };
}
