import { MonorepoTemplate } from '@monots/core';
import { copyTemplate, renameFiles, templateFiles } from '@monots/templates';
import { render } from 'ink';
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

const useCreateMonorepo = ({ cwd, template, name }: CreateProps) => {
  const [state, setState] = useSetState<State>({ step: Step.CopyTemplate });

  useEffect(() => {
    copyTemplate(template.path, cwd)
      .then(() => {
        setState({ step: Step.RenameFiles });
        return renameFiles(template.renameFiles, cwd);
      })
      .then(() => {
        setState({ step: Step.RenameFiles });
        return templateFiles(template, name);
      })
      .then(() => {
        setState({ step: Step.RenameFiles });
        return template;
      });
  }, [template, setState, cwd, name]);

  return state;
};

type CreateProps = {
  template: MonorepoTemplate;
} & AvailableCommands['create'];

export const Create: FC<CreateProps> = (props: CreateProps) => {
  const { step } = useCreateMonorepo(props);

  return <>{step}</>;
};

/**
 * Render the create method.
 */
export const renderCreate = async (props: CreateProps) => {
  const { waitUntilExit } = render(<Create {...props} />);

  await waitUntilExit();
};
