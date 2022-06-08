import { execa } from 'execa';
import { http, https } from 'follow-redirects';
import { createWriteStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import { IncomingMessage } from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import type { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import colors from 'picocolors';
import * as tar from 'tar';
import Zip from 'adm-zip';

interface BinaryProps {
  name: string;
  url: string | URL;
  type: 'zip' | 'tar';
  nested?: boolean;
}

export class Binary {
  readonly url: URL;
  #zipDirectory?: string;
  #zipFilePath?: string;

  /**
   * Get the filename from the url.
   */
  get filename() {
    return this.url.pathname.slice(Math.max(0, this.url.pathname.lastIndexOf('/') + 1));
  }

  get #stream(): Promise<NodeJS.ReadableStream> {
    const protocol = this.url.protocol === 'https:' ? https : http;

    return new Promise<IncomingMessage>((resolve) => {
      protocol.get(this.url, (response) => {
        resolve(response);
      });
    });
  }

  readonly name: string;
  readonly directory: string;
  readonly binary: string;
  readonly type: 'zip' | 'tar';
  /**
   * Set whether the binary is nested in a subfolder of the extracted archive.
   * Currently only works for `tar`.
   */
  readonly nested: boolean;

  constructor(props: BinaryProps) {
    const { name, url, type, nested = false } = props;
    this.url = typeof url === 'string' ? new URL(url) : url;
    this.name = name;
    this.directory = getInstallDirectory();
    this.binary = path.join(this.directory, name);
    this.type = type;
    this.nested = nested;
  }

  /**
   * Install the binary.
   */
  async install() {
    if (await folderExists(this.directory)) {
      await fs.rm(this.directory, { force: true, recursive: true, maxRetries: 2 });
    }

    await fs.mkdir(this.directory, { recursive: true });

    try {
      let extractionStream: Writable;

      if (this.type === 'zip') {
        extractionStream = await this.#createZipStream();
      } else {
        extractionStream = tar.extract({ strip: this.nested ? 1 : undefined, C: this.directory });
      }

      await pipeline(await this.#stream, extractionStream);
      await this.#zip();
    } catch (error) {
      logError(`error extracting the binary ${(error as Error).message}`);
    } finally {
      await this.#cleanZip();
    }
  }

  async run(props: RunProps = {}): Promise<string> {
    const { args = [], stderr = process.stderr, stdout = process.stdout } = props;

    if (!(await fileExists(this.binary))) {
      logError(
        `You must install '${colors.gray(this.name)}' before calling '${colors.green('.run()')}'.`,
      );
    }

    const cliArgs = process.argv.slice(2);

    const subprocess = execa(this.binary, [...args, ...cliArgs]);

    if (stderr) {
      subprocess.stderr?.pipe(process.stderr);
    }

    if (stdout) {
      subprocess.stdout?.pipe(process.stdout);
    }

    const result = await subprocess;

    if (result.stderr) {
      logError(result.stderr);
    }

    if (result.exitCode) {
      process.exit(result.exitCode);
    }

    return result.stdout;
  }

  async #createZipStream(): Promise<Writable> {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'foo-'));
    const filePath = path.join(directory, 'file.zip');
    this.#zipDirectory = directory;
    this.#zipFilePath = filePath;

    return createWriteStream(filePath);
  }

  async #zip() {
    if (this.type !== 'zip' || !this.#zipFilePath) {
      return;
    }

    return new Promise<void>((resolve, reject) =>
      new Zip(this.#zipFilePath).extractAllToAsync(this.directory, true, true, (error) => {
        if (error) {
          reject(error);
        }

        resolve();
      }),
    );
  }

  async #cleanZip() {
    if (!this.#zipDirectory) {
      return;
    }

    await fs.rm(this.#zipDirectory, { force: true, recursive: true, maxRetries: 2 });
    this.#zipDirectory = undefined;
    this.#zipFilePath = undefined;
  }
}

interface RunProps {
  args?: string[];
  /**
   * Set to `false` to disable `stdout`.
   *
   * @default process.stdout
   */
  stdout?: NodeJS.WriteStream | false;

  /**
   * Set to `false` to disable `stderr`.
   *
   * @default process.stderr
   */
  stderr?: NodeJS.WriteStream | false;
}

function logError(message: string, ...args: any[]): never {
  console.error(message, ...args);
  process.exit(1);
}

function getInstallDirectory(fileUrl: string = import.meta.url) {
  return path.join(path.dirname(new URL(fileUrl).pathname), '../node_modules', '.bin');
}

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

/**
 * Check if a file exists for the provided `filePath` the provided target.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.lstat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}
