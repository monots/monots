import type { MaybePromise } from '@monots/types';
import type { Options } from 'del';
import type { execa } from 'execa';
import type { PromptModule } from 'inquirer';
import type { ExportedConfig } from 'load-esm-config';
import type { loadJsonFile } from 'load-json-file';
import type * as fs from 'node:fs/promises';
import type { CopyOperation } from 'recursive-copy';
import type { writeJsonFile } from 'write-json-file';

/**
 * Configuration variables for the monots template.
 *
 * The order of operation is:
 *
 * - gatherVariables()
 * - `installCommand()`
 */
export interface MonotsTemplateConfig extends monots.TemplateConfig {
  /**
   * Files ending in `.template` are automatically processed as templates and
   * the `.template` extension is removed.
   *
   * If you want to ignore processing the `.template` extension, you can add
   * these relative paths and the files will be ignored.
   *
   * The provided paths are normalized.
   *
   * ```ts
   * const options = {
   *   customTemplateFiles: {
   *     // Will not be processed or renamed.
   *     'src/file.template': false,
   *
   *     // Will be processed and renamed to ./awesome.js
   *     'other.template': { process: true, renameTo: awesome.js },
   *   }
   * }
   * ```
   */
  customTemplateFiles?: Record<string, { process: boolean; renameTo: false | string } | false>;

  /**
   * Used when no variables are provided.
   */
  defaultVariables?: Record<string, any>;

  /**
   * Override the default installation command here.
   *
   * Provide a tuple of the command and the arguments or a function.
   */
  installCommand?: InstallCommand<InstallCommandProps>;

  /**
   * Provides the inquirer prompt as a way to collect variables.
   */
  gatherVariables?: (props: GatherVariablesProps) => MaybePromise<Record<string, any>>;

  /**
   * Pick the files to be renamed and ignored.
   *
   * Ignored files will not be copied over from the source directory.
   */
  renamePaths?: (
    props: RenamePathsProps,
  ) => MaybePromise<{ rename?: Record<string, string>; ignore?: string[] }>;

  /**
   * Perform any setup work before the installation command is called.
   */
  preInstall?: (props: PreInstallProps) => MaybePromise<void>;

  /**
   * Perform work after installation is called.
   *
   * In this post install hook you can also use `await import('package')` to
   * import any of the newly installed packages.
   */
  postInstall?: (props: PostInstallProps) => MaybePromise<void>;
}

export interface ExecaProps {
  /**
   * The `execa` module for executing commands with the cwd scoped to the target
   * directory.
   *
   * See https://github.com/sindresorhus/execa#readme for more information.
   *
   * ```
   * const {stdout} = await execa('echo', ['unicorns']);
   * console.log(stdout);
   * // => 'unicorns'
   * ```
   *
   * Save and pipe the output from a child process
   *
   * ```
   * const subprocess = execa('echo', ['foo']);
   * subprocess.stdout.pipe(process.stdout);
   * const { stdout } = await subprocess;
   * console.log(stdout);
   * // => 'foo'
   * ```
   */
  execa: typeof execa;
}

/**
 * An install command that can be used
 */
export type InstallCommand<Props extends object = ExecaProps> =
  | [file: string, arguments?: string[]]
  | ((props: Props) => MaybePromise<void>);

export interface MonotsTemplateProps extends ExecaProps {
  /**
   * The source directory of the template.
   */
  source: string;

  /**
   * The destination directory.
   */
  destination: string;

  /**
   * The current working directory which is responsible for invoking the
   * command.
   *
   * @default process.cwd()
   */
  cwd: string;

  /**
   * All the cli arguments that were passed when created via the cli.
   */
  initialVariables: BaseVariables;
}

export type DefineMonotsTemplate = ExportedConfig<MonotsTemplateConfig, MonotsTemplateProps>;

export interface InstallCommandProps
  extends MonotsTemplateProps,
    VariablesProps,
    FilepathProps,
    InstallProps,
    ResultsProps {}

export interface PreInstallProps
  extends MonotsTemplateProps,
    FilepathProps,
    VariablesProps,
    ResultsProps,
    FileUtils {}

export interface PostInstallProps
  extends MonotsTemplateProps,
    FilepathProps,
    VariablesProps,
    ResultsProps,
    InstallProps,
    FileUtils {}

interface FilepathProps {
  /**
   * The absolute path to the template script if a template file was found.
   */
  filepath?: string;
}

interface VariablesProps {
  /**
   * The loaded variables.
   */
  variables: BaseVariables;
}

interface ResultsProps {
  /**
   * The results of copying the template source files to the destination.
   */
  results: CopyOperation[];
}

interface InstallProps {
  /**
   * Can call install again if any changes have been made that would require a
   * reinstall.
   */
  install: () => Promise<void>;
}

export interface RenamePathsProps extends MonotsTemplateProps, VariablesProps {}

export interface BaseVariables {
  /** All remaining options */
  [key: string]: any;
  name: string;
}

export interface GatherVariablesProps extends MonotsTemplateProps {
  /**
   * The prompt method to gather variables.
   */
  prompt: PromptModule;

  /**
   * The default variables added to the configuration.
   */
  defaultVariables: Record<string, any>;
}

export interface CopyProps {
  /**
   * The source path relative to the provided root path.
   */
  source: string;

  /**
   * The destination path relative to the provided root path.
   */
  destination: string;

  /**
   * Whether to overwrite destination files.
   */
  overwrite?: boolean;
  /**
   * Whether to expand symbolic links.
   */
  expand?: boolean;
  /**
   * Whether to copy files beginning with a `.`
   */
  dot?: boolean;
  /**
   * Whether to copy OS junk files (e.g. `.DS_Store`, `Thumbs.db`).
   */
  junk?: boolean;
  /**
   * Filter function / regular expression / glob that determines which files to copy (uses maximatch).
   */
  filter?: string | string[] | RegExp | ((path: string) => boolean);
}

export interface FileUtils {
  /**
   * All paths are relative to the template destination. You can use an absolute path to reference a file outside of the template destination.
   */
  copy: (props: CopyProps) => Promise<void>;
  read: typeof fs.readFile;
  write: typeof fs.writeFile;
  loadJson: typeof loadJsonFile;
  writeJson: typeof writeJsonFile;
  rm: (patterns: string | readonly string[], options?: Options) => Promise<string[]>;
}

declare global {
  namespace monots {
    interface TemplateConfig {}
  }
}
