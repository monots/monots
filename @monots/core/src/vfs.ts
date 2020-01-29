// import assert from 'assert';
// import * as fs from 'fs-extra';
// import globby from 'globby';
// import { fs as memfs, vol } from 'memfs';
// import Mustache from 'mustache';
// import { join, resolve } from 'path';

// class Store {
//   constructor(cwd: string = process.cwd()) {
//     vol.mkdirSync(cwd, { recursive: true });
//   }

//   public async load(filePath: string) {
//     let content: Buffer | null;
//     try {
//       content = await fs.readFile(filePath);
//     } catch (err) {
//       content = null;
//     }

//     vol.fromJSON({ [filePath]: content?.toString('utf8') ?? null });

//     return vol.readFileSync(filePath);
//   }

//   public async get(filePath: string) {
//     filePath = resolve(filePath);
//     return vol.readFileSync(filePath) || (await this.load(filePath));
//   }
// }

// const load = async (filePath: string) => {
//   let content: Buffer | null;
//   try {
//     content = await fs.readFile(filePath);
//   } catch (err) {
//     content = null;
//   }

//   vol.fromJSON({ [filePath]: content?.toString('utf8') ?? null });

//   return vol.readFileSync(filePath);
// };

// const getFilePath = async (filePath: string) => {
//   filePath = resolve(filePath);
//   return vol.readFileSync(filePath) || (await load(filePath));
// };

// const exists = async (filePath: string) => {
//   await getFilePath(filePath);

//   return vol.existsSync(filePath);
// };

// const globify = async (filePath: string | string[]): Promise<string[] | string> => {
//   if (Array.isArray(filePath)) {
//     const globPaths: string[] = [];

//     for (const path of filePath) {
//       const glob = await globify(path);
//       globPaths.push(...(Array.isArray(glob) ? glob : [glob]));
//     }

//     return globPaths;
//   }

//   if (globby.hasMagic(filePath)) {
//     return filePath;
//   }

//   const fileExists = await fs.pathExists(filePath);

//   if (fileExists) {
//     // The target of a pattern who's not a glob and doesn't match an existing
//     // entity on the disk is ambiguous. As such, match both files and directories.
//     return [filePath, join(filePath, '**')];
//   }

//   const fileStats = await fs.stat(filePath);

//   if (fileStats.isFile()) {
//     return filePath;
//   }

//   if (fileStats.isDirectory()) {
//     return join(filePath, '**');
//   }

//   throw new Error('Only file path or directory path are supported.');
// };

// export type ProcessingFunc = (contents: string | Buffer, path: string) => string | Buffer;

// export interface CopyOptions {
//   process?: ProcessingFunc;
//   globOptions?: any;
// }

// const copy = (
//   from: string | string[],
//   to: string,
//   options?: CopyOptions,
//   context?: Record<string, unknown>,
//   templateOptions?: any,
// ) => {
//   to = path.resolve(to);
//   options = options ?? {};
//   const fromGlob = util.globify(from);

//   const globOptions = extend(options.globOptions || {}, { nodir: true });
//   const diskFiles = globby.sync(fromGlob, globOptions);
//   const storeFiles = [];
//   this.store.each(file => {
//     // The store may have a glob path and when we try to copy it will fail because not real file
//     if (!glob.hasMagic(file.path) && multimatch([file.path], fromGlob).length !== 0) {
//       storeFiles.push(file.path);
//     }
//   });
//   const files = diskFiles.concat(storeFiles);

//   let generateDestination = () => to;
//   if (Array.isArray(from) || !this.exists(from) || glob.hasMagic(from)) {
//     assert(
//       !this.exists(to) || fs.statSync(to).isDirectory(),
//       'When copying multiple files, provide a directory as destination',
//     );

//     const root = util.getCommonPath(from);
//     generateDestination = filepath => {
//       const toFile = path.relative(root, filepath);
//       return path.join(to, toFile);
//     };
//   }

//   // Sanity checks: Makes sure we copy at least one file.
//   assert(
//     options.ignoreNoMatch || files.length > 0,
//     `Trying to copy from a source that does not exist: ${from}`,
//   );

//   files.forEach(file => {
//     this._copySingle(file, generateDestination(file), options, context, tplSettings);
//   });
// };

// const applyProcessingFunc = (
//   process: ProcessingFunc,
//   contents: string | Buffer,
//   filename: string,
// ) => {
//   const output = process(contents, filename);
//   return Buffer.isBuffer(output) ? output : Buffer.from(output);
// };

// const copySingle = (
//   from: string,
//   to: string,
//   options: CopyOptions = {},
//   context: Record<string, unknown>,
//   tplSettings: any,
// ) => {
//   from = resolve(from);
//   to = resolve(to);

//   assert(exists(from), `Trying to copy from a source that does not exist: ${from}`);

//   let contents = memfs.readFileSync(from);

//   if (options.process) {
//     contents = applyProcessingFunc(options.process, contents, from);
//   }

//   if (context) {
//     to = Mustache.render(to, context, tplSettings);
//   }

//   write(to, contents, file.stat);
// };

// const write = (to: string, contents: Buffer | string) => {};
