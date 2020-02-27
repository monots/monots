import { MonorepoTemplate } from '@monots/core';
import {
  addDependencies,
  copyTemplate,
  initializeGit,
  renameFiles,
  templateFiles,
  writePackageJson,
} from '@monots/templates';
import { render } from 'ink';
import { join } from 'path';
import React, { FC, useEffect } from 'react';
import useSetState from 'react-use/lib/useSetState';

/**
 * The order of steps running.
 */
const enum Step {
  CopyTemplate,
  RenameFiles,
  TemplateFiles,
  CreatePackageJson,
  InstallDependencies,
  InitializeGit,
  Complete,
}

const messaging = {
  [Step.CopyTemplate]: 'Copying the template files.',
  [Step.RenameFiles]: 'Renaming files.',
  [Step.TemplateFiles]: 'Replacing template variables.',
  [Step.CreatePackageJson]: 'Creating the template package.',
  [Step.InstallDependencies]: 'Installing dependencies.',
  [Step.InitializeGit]: 'Initializing git.',
  [Step.Complete]: 'Your project has successfully been generated',
};

interface State {
  step: Step;
}

const useCreateMonorepo = ({ cwd, config, name, license, commitType }: CreateProps) => {
  const [state, setState] = useSetState<State>({ step: Step.CopyTemplate });

  const destination = join(cwd, name);

  useEffect(() => {
    copyTemplate(config.path, destination)
      .then(() => {
        setState({ step: Step.RenameFiles });
        return renameFiles(config.renameFiles, destination);
      })
      .then(() => {
        setState({ step: Step.TemplateFiles });
        return templateFiles(config, name, destination);
      })
      .then(() => {
        setState({ step: Step.CreatePackageJson });
        const json = config.createPackageJson(config.extraContext({ license, name }));
        return writePackageJson(json, destination);
      })
      .then(() => {
        setState({ step: Step.InstallDependencies });
        addDependencies(config.devDependencies, { dev: true, cwd: destination });
      })
      .then(() => {
        setState({ step: Step.InitializeGit });
        initializeGit({ commitType, cwd: destination });
      })
      .then(() => {
        setState({ step: Step.Complete });
      });
  }, [config, setState, cwd, name, destination, license, commitType]);

  return state;
};

type CreateProps = {
  config: MonorepoTemplate;
} & AvailableCommands['create'];

export const Create: FC<CreateProps> = (props: CreateProps) => {
  const { step } = useCreateMonorepo(props);

  return (
    <>
      {step} {messaging[step]}
    </>
  );
};

/**
 * Render the create method.
 */
export const renderCreate = async (props: CreateProps) => {
  const { waitUntilExit } = render(<Create {...props} />);

  await waitUntilExit();
};
