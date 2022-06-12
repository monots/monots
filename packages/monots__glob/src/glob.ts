import anymatch, { type Matcher } from 'anymatch';
import { isError } from 'is-what';
import type { Dirent, ObjectEncodingOptions, PathLike } from 'node:fs';
import fs from 'node:fs/promises';
import * as path from 'node:path';
import normalizePath from 'normalize-path';

const DEFAULT_FS: FsMethods = {
  readdir: fs.readdir,
  realpath: fs.realpath,
  lstat: fs.lstat,
};

/**
 * An async iterable for searching through the provided patterns relative to the
 * `cwd`.
 *
 * ```ts
 * import { glob } from '@monots/glob';
 *
 * for await (const entry of glob('packages', { matches: ['*.package.json'] })) {
 *   const contents = await fs.readFile(entry, 'utf8');
 *   const json = JSON.parse(contents);
 *
 *   if (json.name === "@monots/target") {
 *     // do something
 *     break;
 *   }
 * }
 *```
 */
export async function* glob(options: GlobProps = {}) {
  const props = { ...DEFAULT_OPTIONS, ...options };
  const cwd = getPath(props.cwd);
  const pico = { dot: props.dot, nocase: props.caseInsensitive };
  const includePattern = props.expandDirectories ? expandPattern(props.include) : props.include;
  const excludePattern = props.expandDirectories ? expandPattern(props.exclude) : props.exclude;
  const includer = createMatchFunction(includePattern, pico);
  const excluder = createMatchFunction(excludePattern, pico);
  const directory = normalizeDirectory(cwd);
  const stat = await props.fs.lstat(cwd);
  const isSymbolicLink = stat.isSymbolicLink();

  if (stat.isFile()) {
    throw wrapErrorWithRootPath(new TypeError('The `cwd` must not point to a file'), cwd);
  }

  if (isSymbolicLink && !props.followSymlinks) {
    return;
  }

  yield* walkDirectory(
    { depth: props.maxDepth, root: directory, isSymbolicLink },
    { ...props, includer, excluder, cwd },
  );
}

const DEFAULT_OPTIONS: Required<GlobProps> = {
  include: ['**'],
  exclude: [],
  extensions: null,
  cwd: process.cwd(),
  fs: DEFAULT_FS,
  maxDepth: Number.POSITIVE_INFINITY,
  absolute: false,
  includeFiles: true,
  includeDirectories: true,
  followSymlinks: true,
  dot: false,
  expandDirectories: true,
  emptyDirectories: false,
  trailingSlash: true,
  caseInsensitive: false,
  concurrent: false,
};

type MatchFunction = (filename: string) => boolean;

interface Entry {
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
}

interface WalkDirectoryOptions extends Required<Omit<GlobProps, 'cwd'>> {
  includer: MatchFunction;
  excluder: MatchFunction;
  cwd: string;
}

interface WalkDirectoryProps {
  depth: number;
  root: string;
  isSymbolicLink?: boolean;
}

async function* walkDirectory(
  props: WalkDirectoryProps,
  options: WalkDirectoryOptions,
): AsyncGenerator<Entry, void> {
  if (props.depth < 0) {
    return;
  }

  const relativeDirectory = path.relative(options.cwd, props.root);
  const concurrentIterators: Array<AsyncGenerator<Entry, void>> = [];
  const concurrentFiles: Entry[] = [];
  const includeProps = {
    excluder: options.excluder,
    includer: options.includer,
    extensions: options.extensions,
  };

  if (options.includeDirectories && shouldInclude({ path: relativeDirectory, ...includeProps })) {
    yield {
      isDirectory: !props.isSymbolicLink,
      isFile: false,
      isSymlink: !!props.isSymbolicLink,
      path: normalizeDirectory(
        options.absolute ? props.root : relativeDirectory,
        options.trailingSlash,
      ),
    };
  }

  if (props.depth < 1 || !shouldInclude({ path: props.root, excluder: options.excluder })) {
    return;
  }

  try {
    // load the entries in the directory
    const entries = await options.fs.readdir(props.root, { withFileTypes: true });

    for (const entry of entries) {
      let resolvedRoot = path.resolve(props.root, entry.name);
      let relativeRoot = path.relative(options.cwd, resolvedRoot);
      // A child directory to search for matches in to
      let childDirectoryProps: WalkDirectoryProps | undefined;
      // A file that matches and should be yielded
      let fileToYield: Entry | undefined;

      let isSymbolicLink = entry.isSymbolicLink();
      let isDirectory = entry.isDirectory();

      if (isSymbolicLink) {
        if (!options.followSymlinks) {
          continue;
        }

        resolvedRoot = await options.fs.realpath(resolvedRoot);
        relativeRoot = path.relative(options.cwd, resolvedRoot);
        const stat = await options.fs.lstat(resolvedRoot);
        isSymbolicLink = stat.isSymbolicLink();
        isDirectory = stat.isDirectory();
      }

      if (isSymbolicLink || isDirectory) {
        childDirectoryProps = {
          depth: props.depth - 1,
          root: normalizeDirectory(resolvedRoot),
          isSymbolicLink,
        };
      } else if (options.includeFiles && shouldInclude({ path: relativeRoot, ...includeProps })) {
        fileToYield = {
          path: options.absolute ? resolvedRoot : relativeRoot,
          isDirectory: false,
          isSymlink: false,
          isFile: true,
        };
      }

      if (fileToYield) {
        options.concurrent ? concurrentFiles.push(fileToYield) : yield fileToYield;
      }

      if (childDirectoryProps) {
        options.concurrent
          ? concurrentIterators.unshift(walkDirectory(childDirectoryProps, options))
          : yield* walkDirectory(childDirectoryProps, options);
      }
    }

    if (!options.concurrent) {
      return;
    }

    yield* combine(concurrentIterators);

    for (const entry of concurrentFiles) {
      yield entry;
    }
  } catch (error) {
    throw wrapErrorWithRootPath(error, props.root);
  }
}

function wrapErrorWithRootPath(error: unknown, root: string) {
  if (isError(error) && 'root' in error) {
    return error;
  }

  const errorWithRoot = new Error() as Error & { root: string };

  errorWithRoot.root = root;
  errorWithRoot.message = isError(error)
    ? `${error.message} for path "${root}"`
    : `[non-error thrown] for path "${root}"`;
  errorWithRoot.stack = error instanceof Error ? error.stack : undefined;
  errorWithRoot.cause = error instanceof Error ? error.cause : undefined;

  return errorWithRoot;
}

/**
 * Normalize a path as a directory.
 */
function normalizeDirectory(directory: string, trailingSlash = false) {
  directory = path.normalize(normalizePath(directory));
  return trailingSlash && !directory.endsWith('/') ? `${directory}/` : directory;
}

/**
 * Get the normalized path of the provided `path`.
 */
export function getPath(filepath: string | URL): string {
  return filepath instanceof URL
    ? filepath.pathname
    : filepath.startsWith('file:')
    ? new URL(filepath).pathname
    : path.normalize(normalizePath(filepath));
}

/**
 * Custom fs methods which are used to mock the file system.
 */
export interface FsMethods {
  readdir: typeof fs.readdir;
  realpath: typeof fs.realpath;
  lstat: typeof fs.lstat;
}

export interface GlobProps {
  /**
   * Provide matchers to match by the file / directory name relative to the
   * `cwd`.
   *
   * If left undefined, all files and directories will be matched. This is the
   * equivalent of setting
   *
   * ```ts
   * matches: ['**']
   * ```
   *
   * In order to ignore files lead the glob with a `!`.
   *
   * ```ts
   * matches: ['!node_modules/**', '**']
   * ```
   *
   * The above will ignore all files and directories in the `node_modules`
   * directory.
   *
   * @default ['**']
   */
  include?: Matcher;

  /**
   * Any matching patterns will be excluded from the results.
   *
   * @default []
   */
  exclude?: Matcher;

  /**
   * The extensions that can be matched. Setting this to anything other than an
   * empty array / or null will prevent matches on directories. Unless the
   * directory has an extension 🤷‍♀️.
   */
  extensions?: string[] | null;

  /**
   * The search will be resolved from this directory.
   *
   * @default process.cwd()
   */
  cwd?: string | URL;

  /**
   * The promise based file system methods to use. This allows for mocking the
   * file system.
   *
   * @default
   *
   * ```ts
   * import { fs } from 'node:fs/promises';
   * ```
   */
  fs?: FsMethods;

  /**
   * Use this to limit the maximum depth `@monots/glob` will crawl to before
   * stopping.
   *
   * > By default, `@monots/glob` crawls recursively until the last directory.
   *
   * @default Infinity
   */
  maxDepth?: number;

  /**
   * Use this to resolve and recurse over all symlinks.
   *
   * > NOTE: This will affect crawling performance so use only if required.
   *
   * @default false
   */
  followSymlinks?: boolean;

  /**
   * Use this to include directories in the output.
   *
   * @default true
   */
  includeDirectories?: boolean;

  /**
   * Include files in the output.
   *
   * @default true
   */
  includeFiles?: boolean;

  /**
   * Use this to get full absolute paths in the output.
   *
   * > By default, `@monots/glob` returns paths relative to the `cwd`.
   *
   * @default false
   */
  absolute?: boolean;

  /**
   * If a pattern ends in a `<pattern>/` it will be expanded to `<pattern>/**`.
   *
   * @default false
   */
  expandDirectories?: boolean;

  /**
   * Mark directories with a trailing slash.
   *
   * @default true
   */
  trailingSlash?: boolean;

  /**
   * Match empty directories. This is not active when `onlyFiles` is `true`.
   */
  emptyDirectories?: boolean;

  /**
   * Set to true to match regardless of state.
   *
   * @default false
   */
  caseInsensitive?: boolean;

  /**
   * When true will match dot files and folders.
   *
   * @default false
   */
  dot?: boolean;

  /**
   * By default the async iterator is sequentially iterated. Setting this to
   * true will concurrently over the sub directories.
   *
   * @default false
   *
   * TODO add support for setting a number to denote the maximum number of
   * concurrent operations.
   */
  concurrent?: boolean;
}

function expandPattern(pattern: Matcher): Matcher {
  if (typeof pattern === 'string') {
    return pattern.endsWith('/') ? `${pattern}**/*` : pattern;
  }

  if (Array.isArray(pattern)) {
    return pattern.flatMap((item) => expandPattern(item));
  }

  return pattern;
}

type IteratorPromise<Yield, Return> = Promise<{
  index: number;
  result: IteratorResult<Yield, Return>;
}>;

/**
 * Combines an array of generators to run concurrently.
 *
 * Taken from https://stackoverflow.com/a/50586391/2172153
 */
async function* combine<Yield, Return = any, Next = unknown>(
  iterable: Array<AsyncGenerator<Yield, Return, Next>>,
  defaultReturn: Return,
) {
  const never: IteratorPromise<Yield, Return> = new Promise(() => {});
  const asyncIterators = [...iterable].map((o) => o[Symbol.asyncIterator]());
  const results = [];
  let count = asyncIterators.length;

  async function getNext(asyncIterator: AsyncGenerator<Yield, Return, Next>, index: number) {
    const result = await asyncIterator.next();
    return { index, result };
  }

  const nextPromises = asyncIterators.map((iterator, index) => getNext(iterator, index));

  try {
    while (count) {
      const { index, result } = await Promise.race(nextPromises);

      if (result.done) {
        nextPromises[index] = never;
        results[index] = result.value;
        count--;
      } else {
        const iterator = asyncIterators[index];

        if (!iterator) {
          // this shouldn't happen
          continue;
        }

        nextPromises[index] = getNext(iterator, index);
        yield result.value;
      }
    }
  } finally {
    // no await here - see
    // https://github.com/tc39/proposal-async-iteration/issues/126
    for (const [index, iterator] of asyncIterators.entries()) {
      if (nextPromises[index] !== never && iterator.return != null) {
        iterator.return(defaultReturn);
      }
    }
  }
  return results;
}

interface ShouldIncludeProps {
  path: string;
  includer?: MatchFunction;
  excluder?: MatchFunction;
  extensions?: string[] | null;
}

/**
 * Determine whether a path should be included in the results.
 */
function shouldInclude(props: ShouldIncludeProps): boolean {
  const { path, excluder, extensions, includer } = props;

  if (
    (extensions && !extensions.some((extension) => path.endsWith(extension))) ||
    includer?.(path) === false ||
    excluder?.(path) === true
  ) {
    return false;
  }

  return true;
}

function createMatchFunction(pattern: Matcher, options: { dot: boolean }): MatchFunction {
  return (filename: string) => anymatch(pattern, filename, options) as unknown as boolean;
}
