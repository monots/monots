import { fs } from 'memfs';

const { promises } = fs;
export const {
  Dirent,
  FSWatcher,
  ReadStream,
  StatWatcher,
  Stats,
  WriteStream,
  _toUnixTimestamp,
  constants,
  ino,
  inodes,
  fds,
  maxFiles,
  openFiles,
  releasedFds,
  props,
  releasedInos,
  root,
} = fs;

export const {
  FileHandle,
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  link,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  symlink,
  truncate,
  unlink,
  utimes,
  writeFile,
} = promises;

// eslint-disable-next-line import/no-default-export
export default promises;
