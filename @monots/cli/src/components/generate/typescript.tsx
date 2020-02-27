// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../patches.d.ts" />

import { prettifyFiles, relative } from '@monots/core';
import { GenerateTypeScriptReturn } from '@monots/core/lib/generate/tsconfig';
import is from '@sindresorhus/is';
import figures from 'figures';
import { Box, Color, render, Text } from 'ink';
import Link from 'ink-link';
import Spinner from 'ink-spinner';
import ms from 'ms';
import React, { FC, useEffect } from 'react';
import useSetState from 'react-use/lib/useSetState';

import { BaseCommandProps } from '../../types';

const enum Step {
  Generate,
  Write,
  Prettify,
  Complete,
}

const messaging = {
  [Step.Generate]: 'Generating the tsconfig files',
  [Step.Write]: 'Writing the generated files to disk',
  [Step.Prettify]: 'Prettifying the generated files',
  [Step.Complete]: 'Your files have successfully been generated',
};

interface GenerateTsState {
  error?: Error;
  endTime?: number;
  step: Step;
  files?: string[];
}

type GeneratedData = Partial<
  Record<'mainBuildConfig' | 'packagesBuildConfig' | 'baseConfig', GenerateTypeScriptReturn>
>;

export interface GenerateTypeScriptProps extends Required<BaseCommandProps> {
  startTime?: number;
  generate(): Promise<() => Promise<GeneratedData>>;
}

const getFileData = (data: GeneratedData): string[] => {
  const {
    baseConfig = { paths: [] },
    mainBuildConfig = { paths: [] },
    packagesBuildConfig = { paths: [] },
  } = data;
  const files = [...baseConfig.paths, ...mainBuildConfig.paths, ...packagesBuildConfig.paths];

  return files;
};

const useGenerateTs = ({ generate, startTime = Date.now() }: GenerateTypeScriptProps) => {
  const [state, setState] = useSetState<GenerateTsState>({ step: Step.Generate });
  const { endTime } = state;
  const completed = state.step === Step.Complete;

  useEffect(() => {
    generate()
      .then(write => {
        setState({ step: Step.Write });
        return write();
      })
      .then(data => {
        setState({ step: Step.Prettify, files: getFileData(data) });
        return prettifyFiles();
      })
      .then(() => setState({ step: Step.Complete, endTime: Date.now() }))
      .catch(e => setState({ error: e, endTime: Date.now() }));
  }, [generate, setState]);

  return { ...state, duration: endTime ? endTime - startTime : undefined, completed };
};

/**
 * Renders a loading line
 */
const LoadingLine: FC<GenerateTsState & { value: Step }> = ({ step, error, value, children }) => {
  if (step < value) {
    return null;
  }

  const getElement = () => {
    if (error) {
      return <Color red={true}>{figures.cross}</Color>;
    }

    if (step === value) {
      return <Spinner />;
    }

    return <Color green={true}>{figures.tick}</Color>;
  };

  return (
    <Box height={1}>
      <Box paddingRight={2}>{getElement()}</Box>
      <Text>
        <Color grey={true}>{children}</Color>
      </Text>
    </Box>
  );
};

/**
 * Renders the loading component and timestamp for the command.
 */
export const GenerateTypeScript = ({ verbose, ...props }: GenerateTypeScriptProps) => {
  const { completed, duration, files, ...state } = useGenerateTs({
    verbose,
    ...props,
  });

  return (
    <>
      <LoadingLine {...state} value={Step.Generate}>
        {messaging[Step.Generate]}
      </LoadingLine>
      <LoadingLine {...state} value={Step.Write}>
        {messaging[Step.Write]}
      </LoadingLine>
      <LoadingLine {...state} value={Step.Prettify}>
        {messaging[Step.Prettify]}
      </LoadingLine>
      {completed && (
        <>
          <Box height={1} paddingLeft={3} marginY={1}>
            <Color green={true} bold={true}>
              {messaging[Step.Complete]}
            </Color>
          </Box>
          {files && (
            <Box height={1} paddingLeft={3} marginBottom={verbose ? 0 : 1}>
              <Color cyan={true}>Files generated: {files.length}</Color>
            </Box>
          )}
          {verbose &&
            files?.length &&
            files.map((file, index) => (
              <Box
                height={1}
                paddingLeft={3}
                key={file}
                marginBottom={index >= files.length - 1 ? 1 : 0}
              >
                <Color grey>
                  <Link url={`file://${file}`} fallback={false}>
                    {relative(process.cwd(), file)}
                  </Link>
                </Color>
              </Box>
            ))}
        </>
      )}
      {is.number(duration) && verbose && (
        <Box height={1} paddingBottom={2}>
          <Box paddingRight={2}>
            <Color blue={true}>{figures.info}</Color>
          </Box>
          <Color>Duration: {ms(duration)}</Color>
        </Box>
      )}
    </>
  );
};

export const renderGenerateTypeScript = async (props: GenerateTypeScriptProps) => {
  const { waitUntilExit } = render(<GenerateTypeScript {...props} />);

  await waitUntilExit();
};
