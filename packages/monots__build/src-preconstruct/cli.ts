import meow from 'meow';

import build from './build';
import watch from './build/watch';
import dev from './dev';
import {
  BatchError,
  FatalError,
  FixableError,
  ScopelessError,
  UnexpectedBuildError,
} from './errors';
import fix from './fix';
import init from './init';
import { error, info, log } from './logger';
import validate from './validate';

// tricking static analysis is fun
// @ts-ignore
process['e' + 'nv'].NODE_ENV = 'production';

const { input } = meow(
  `
Usage
  $ monots [command]
Commands
  init         initialise a project
  build        build the project
  watch        start a watch process to build the project
  validate     validate the project
  fix          infer as much information as possible and fix the project
  dev          create links so entrypoints can be imported

`,
  {},
);

const errors = {
  commandNotFound: 'Command not found',
};

class CommandNotFoundError extends Error {}

(async () => {
  if (input.length === 1) {
    switch (input[0]) {
      case 'init': {
        await init(process.cwd());
        return;
      }
      case 'validate': {
        await validate(process.cwd());
        return;
      }
      case 'build': {
        await build(process.cwd());
        return;
      }
      case 'watch': {
        await watch(process.cwd());
        return;
      }
      case 'fix': {
        await fix(process.cwd());
        return;
      }
      case 'dev': {
        await dev(process.cwd());
        return;
      }
      default: {
        throw new CommandNotFoundError();
      }
    }
  } else {
    throw new CommandNotFoundError();
  }
})().catch((error_) => {
  let hasFixableError = false;

  if (error_ instanceof FixableError) {
    hasFixableError = true;
    error(error_.message, error_.scope);
  } else if (error_ instanceof FatalError) {
    error(error_.message, error_.scope);
  } else if (error_ instanceof BatchError) {
    for (const fatalError of error_.errors) {
      if (fatalError instanceof FixableError) {
        hasFixableError = true;
        error(fatalError.message, fatalError.scope);
      } else {
        error(fatalError.message, fatalError.scope);
      }
    }
  } else if (error_ instanceof CommandNotFoundError) {
    error(errors.commandNotFound);
  } else if (error_ instanceof UnexpectedBuildError) {
    error(error_.message, error_.scope);
  } else if (error_ instanceof ScopelessError) {
    log(error_.message);
  } else {
    error(error_);
  }

  if (hasFixableError) {
    info('Some of the errors above can be fixed automatically by running monots fix');
  }

  info('If want to learn more about the above error, check https://monots.tools/errors');
  info(
    'If the error is not there and you want to learn more about it, open an issue at https://github.com/monots/monots/issues/new',
  );
  process.exit(1);
});
