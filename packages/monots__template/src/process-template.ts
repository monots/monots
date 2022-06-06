import { deepMerge, resolvePath, fileExists } from '@monots/utils';
import { isArray, isFunction, isPlainObject } from 'is-what';
import { execa as baseExeca } from 'execa';
import { prompt } from 'inquirer';
import type { LoadEsmConfigOptions } from 'load-esm-config';
import { loadEsmConfig } from 'load-esm-config';
import type { GetPattern } from 'load-esm-config/src/constants.js';
import * as path from 'node:path';
import type { CopyOperation } from 'recursive-copy';

import { copyTemplate } from './copy-template.js';
import type {
  BaseVariables,
  InstallCommand,
  MonotsTemplateConfig,
  MonotsTemplateProps,
} from './types.js';
import { createFileUtils } from './file-utils.js';

export interface LoadTemplateProps
  extends Pick<LoadEsmConfigOptions, 'cwd' | 'logLevel' | 'config'>,
    Pick<MonotsTemplateProps, 'source' | 'destination' | 'initialVariables'> {
  /**
   * The install command that will be called after the template is copied to the
   * destination.
   *
   * If a `package.json` file exists at the root of the template source
   * directory, an installation before the template configuration file is
   * loaded. This is essential if you want to use external packages in the
   * template script file.
   *
   * ```diff
   *   .
   *   ├── .
   *   ├── src
   *   │   └── index.ts
   * + ├── package.json
   *   └── readme.md
   * ```
   *
   * To keep the package.json file in the destination folder as well as skipping
   * the source installation, rename your `package.json` file to
   * `package.json.template`.
   *
   * ```diff
   *   .
   *   ├── .
   *   ├── src
   *   │   └── index.ts
   * - ├── package.json
   * + ├── package.json.template
   *   └── readme.md
   * ```
   *
   * To ensure both a pre-installation and a templated `package.json` file use
   * the following template structure.
   *
   * ```diff
   *   .
   *   ├── .
   *   ├── src
   *   │   └── index.ts
   * + ├── package.json
   * + ├── package.json.template
   *   └── readme.md
   * ```
   */
  install: InstallCommand<{ execa: typeof baseExeca }>;

  /**
   * Whether to overwrite destination files.
   */
  overwrite?: boolean;
}

/**
 * Load the template file from the source and process the template.
 */
export async function processTemplate(props: LoadTemplateProps) {
  const execa = createExeca(props.destination);
  const templateProps = {
    initialVariables: props.initialVariables,
    source: props.source,
    destination: props.destination,
    execa,
    cwd: props.cwd ?? process.cwd(),
  };
  const getArgument = (): MonotsTemplateProps => templateProps;

  if (await fileExists(path.join(props.source, 'package.json'))) {
    const installer = getInitialInstall(props.install, { execa: createExeca(props.source) });
    await installer();
  }

  const result = (await loadEsmConfig<MonotsTemplateConfig, MonotsTemplateProps>({
    getPattern,
    getArgument,
    cwd: props.source,
    dirs: [''],
    config: props.config,
    logLevel: props.logLevel,
    name: 'monots',
    alias: { '@monots/template': await resolvePath('@monots/template', import.meta.url) },
    disableUpwardLookup: true,
  })) ?? {
    config: deepMerge([DEFAULT_CONFIG, props.config ?? {}]),
    dependencies: [],
    path: undefined,
    root: undefined,
  };

  let variables = { ...props.initialVariables, ...result.config.defaultVariables };
  variables = result.config.gatherVariables
    ? {
        ...props.initialVariables,
        ...(await result.config.gatherVariables({
          ...templateProps,
          defaultVariables: variables,
          prompt,
        })),
      }
    : variables;
  const { rename = {}, ignore = [] } = result.config.renamePaths
    ? await result.config.renamePaths({ ...templateProps, variables })
    : {};

  if (result.path && result.root) {
    // todo probably shouldn't mutate the result: change if issue is raised
    ignore.push(path.relative(result.root, result.path));
  }

  const results = await copyTemplate({
    destination: props.destination,
    source: props.source,
    rename,
    ignore,
    variables,
    customTemplateFiles: result.config.customTemplateFiles,
    overwrite: props.overwrite,
  });

  const install = getInstallCommand({
    templateProps,
    results,
    variables,
    custom: result.config.installCommand,
    filepath: result.path,
    initial: props.install,
  });

  const fileUtilProps = createFileUtils(props.destination);
  const hookProps = { results, variables, filepath: result.path };

  if (result.config.preInstall) {
    await result.config.preInstall({ ...templateProps, ...fileUtilProps, ...hookProps });
  }

  await install();

  if (result.config.postInstall) {
    await result.config.postInstall({ ...templateProps, ...fileUtilProps, ...hookProps, install });
  }
}

const DEFAULT_CONFIG: MonotsTemplateConfig = {
  customTemplateFiles: {},
  defaultVariables: {},
  gatherVariables: async () => ({}),
};

const getPattern: GetPattern = (props) => {
  return [path.join(props.directory, `${props.name}.template${props.extension}`)];
};

interface GetInstallCommand {
  results: CopyOperation[];
  variables: BaseVariables;
  templateProps: MonotsTemplateProps;
  initial: InstallCommand<{ execa: typeof baseExeca }>;
  custom: MonotsTemplateConfig['installCommand'];
  filepath?: string;
}

function getInitialInstall(
  install: InstallCommand<{ execa: typeof baseExeca }>,
  props: { execa: typeof baseExeca },
) {
  if (isFunction(install)) {
    return async () => {
      await install(props);
    };
  }

  const [file, rest = []] = install;

  return async () => {
    await props.execa(file, rest, { stdio: 'inherit' });
  };
}

/**
 * Get the installation command.
 */
function getInstallCommand(props: GetInstallCommand): () => Promise<void> {
  const { custom, initial, templateProps, variables, filepath, results } = props;
  const { execa } = templateProps;
  let install = getInitialInstall(initial, templateProps);

  if (isArray(custom)) {
    const [file, rest = []] = custom;

    return async () => {
      await execa(file, rest, { stdio: 'inherit' });
    };
  }

  if (isFunction(custom)) {
    return async () => {
      await custom({ ...templateProps, variables, filepath, install, results });
    };
  }

  return install;
}

function createExeca(cwd: string): typeof baseExeca {
  const defaultOptions = { cwd };

  return function execa(...args: any[]) {
    const [file, segments, options] = args;

    if (args.length === 1) {
      return baseExeca(file, defaultOptions);
    }

    if (args.length === 2 && isPlainObject(segments)) {
      return baseExeca(file, { ...defaultOptions, ...segments });
    }

    return baseExeca(file, segments, { ...defaultOptions, ...options });
  } as any;
}
