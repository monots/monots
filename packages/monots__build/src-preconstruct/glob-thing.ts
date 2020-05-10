import * as fs from 'fs-extra';
import normalizePath from 'normalize-path';
import parseGlob from 'parse-glob';
import path from 'path';

export async function getUselessGlobsThatArentReallyGlobsForNewEntrypoints(
  globs: string[],
  files: string[],
  cwd: string,
) {
  const filesSet = new Set(files.map((x) => normalizePath(x)));
  return (
    await Promise.all(
      globs.map(async (glob) => {
        const parsedGlobResult = parseGlob(glob);

        if (!parsedGlobResult.is.glob) {
          const filename = normalizePath(path.resolve(cwd, 'src', glob));

          if (filesSet.has(filename)) {
            return;
          }

          try {
            await fs.stat(filename);
          } catch (error) {
            if (error.code === 'ENOENT') {
              return { filename, glob, exists: false };
            }

            throw error;
          }
          return { filename, glob, exists: true };
        }
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => !!x);
}
