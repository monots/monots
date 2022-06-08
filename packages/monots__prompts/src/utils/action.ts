import type { Key } from 'node:readline';

/**
 * Returns an action name from the keypress event.
 */
export function getActionFromKeyPress(key: Key, isSelect: boolean): PromptAction {
  if (key.meta && key.name !== 'escape') {
    return 'invalid';
  }

  if (key.ctrl) {
    if (key.name === 'a') {
      return 'first';
    }

    if (key.name === 'c') {
      return 'abort';
    }

    if (key.name === 'd') {
      return 'abort';
    }

    if (key.name === 'e') {
      return 'last';
    }

    if (key.name === 'g') {
      return 'reset';
    }
  }

  if (isSelect) {
    if (key.name === 'j') {
      return 'down';
    }

    if (key.name === 'k') {
      return 'up';
    }
  }

  if (key.name === 'return') {
    return 'submit';
  }

  if (key.name === 'enter') {
    return 'submit';
  } // ctrl + J

  if (key.name === 'backspace') {
    return 'delete';
  }

  if (key.name === 'delete') {
    return 'deleteForward';
  }

  if (key.name === 'abort') {
    return 'abort';
  }

  if (key.name === 'escape') {
    return 'exit';
  }

  if (key.name === 'tab') {
    return 'next';
  }

  if (key.name === 'pagedown') {
    return 'nextPage';
  }

  if (key.name === 'pageup') {
    return 'prevPage';
  }

  // TODO create home() in prompt types (e.g. TextPrompt)
  if (key.name === 'home') {
    return 'home';
  }

  // TODO create end() in prompt types (e.g. TextPrompt)
  if (key.name === 'end') {
    return 'end';
  }

  if (key.name === 'up') {
    return 'up';
  }

  if (key.name === 'down') {
    return 'down';
  }

  if (key.name === 'right') {
    return 'right';
  }

  if (key.name === 'left') {
    return 'left';
  }

  return 'unknown';
}
export type PromptAction = keyof PromptActions;
export type UnknownAction = (char: string, key: Key) => void;
export type Action = (key: Key) => void;
export interface PromptActions {
  /**
   * Causes the bell to ring.
   */
  invalid: () => void;
  unknown: UnknownAction;
  first: Action;
  abort: Action;
  last: Action;
  reset: Action;
  down: Action;
  up: Action;
  submit: Action;
  delete: Action;
  deleteForward: Action;
  exit: Action;
  next: Action;
  nextPage: Action;
  prevPage: Action;
  home: Action;
  end: Action;
  right: Action;
  left: Action;
}
