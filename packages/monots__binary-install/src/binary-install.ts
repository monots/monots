import chalk from 'chalk';
import del from 'del';
import {
  createReadStream,
  // createWriteStream
} from 'node:fs';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';
import fetch from 'node-fetch';
// import StreamZip from 'node-stream-zip';
// import * as tar from 'tar';

/**
 * Check if a folder exists for the provided `folderPath` the provided target.
 */
async function folderExists(folderPath: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(folderPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

interface BinaryProps {
  name: string;
  url: string | URL;
  type: 'zip' | 'tar';
}

export class Binary {
  readonly url: URL;

  /**
   * Get the filename from the url.
   */
  get filename() {
    return this.url.pathname.slice(Math.max(0, this.url.pathname.lastIndexOf('/') + 1));
  }

  readonly name: string;
  readonly directory: string;
  readonly binary: string;
  readonly type: 'zip' | 'tar';

  constructor({ name, url, type }: BinaryProps) {
    this.url = typeof url === 'string' ? new URL(url) : url;
    this.name = name;
    this.directory = getInstallDirectory();
    this.binary = path.join(this.directory, name);
    this.type = type;
  }

  /**
   * Install the binary.
   */
  async install() {
    if (await folderExists(this.directory)) {
      await del(this.directory, { force: true });
      // TODO use the napi module here (delete) https://github.com/suptejas/delete/blob/master/src/lib.rs
    }

    await fs.mkdir(this.directory, { recursive: true });
    console.log(`Downloading release ${this.url}`);

    const { body } = await fetch(this.url.toString());

    if (!body) {
      logError('could not download binary');
    }

    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'tmp-'));

    // const extractStream =
    //   this.type === 'zip' ? new StreamZip.async({}) : tar.x({ strip: 1, C: this.directory });

    await pipeline([body, createReadStream(path.join(tmpdir, this.filename))]);

    // extract

    // delete tmpdir
    await del(tmpdir, { force: true });
  }

  async run() {
    if (!(await folderExists(this.binary))) {
      logError(
        `You must install '${chalk.gray(this.name)}' before calling '${chalk.green('.run()')}'.`,
      );
    }
  }
}

function logError(message: string): never {
  console.error(message);
  process.exit(1);
}

function getInstallDirectory(fileUrl: string = import.meta.url) {
  return path.join(path.dirname(new URL(fileUrl).pathname), 'node_modules', '.bin');
}
