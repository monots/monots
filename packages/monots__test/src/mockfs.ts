import { vol } from 'memfs';
import * as path from 'node:path';

declare type DirectoryContent = string | null;

export interface DirectoryJson {
  [key: string]: DirectoryContent;
}

export interface NestedDirectoryJson {
  [key: string]: DirectoryContent | NestedDirectoryJson;
}

interface SetupFileSystemProps<Context extends object> {
  /**
   * @default '/test'
   */
  cwd?: string;

  /**
   * File system json
   */
  json: NestedDirectoryJson;
  /**
   * The context to use.
   */
  context: Context;
}

export function setupFileSystem<Context extends object>(props: SetupFileSystemProps<Context>) {
  const { cwd = '/test', json, context } = props;

  function getPath(...paths: string[]) {
    return path.join(cwd, ...paths);
  }

  // load the json into the file system
  vol.fromNestedJSON(json, cwd);

  return {
    getPath,
    context: { ...context, cwd },
  };
}
