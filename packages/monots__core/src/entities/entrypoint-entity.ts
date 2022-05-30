import { hasDefaultExport } from '@monots/utils';
import * as fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import normalizePath from 'normalize-path';
import sortKeys from 'sort-keys';
import { entries } from 'ts-entries';

import { createTypeScriptContent, generateField } from '../helpers/index.js';
import type { EntrypointField, ExportsField } from '../schema.js';
import { Entrypoint, entrypointFields } from '../schema.js';
import type { BaseEntityProps } from './base-entity.js';
import { BaseEntity } from './base-entity.js';
import type { PackageEntity } from './package-entity.js';

const require = createRequire(import.meta.url);

interface EntrypointEntityProps extends BaseEntityProps<Entrypoint> {
  /**
   * The parent package entity.
   */
  package: PackageEntity;

  /**
   * The absolute path to the source file for this entity.
   */
  source: string;

  /**
   * The contents of the source file.
   */
  contents: string;
}

/**
 * Each package can have multiple entities and this is the representation of the
 * entrypoint.
 */
export class EntrypointEntity extends BaseEntity<Entrypoint> {
  /**
   * The parent package entity.
   */
  package: PackageEntity;

  /**
   * The absolute path to the source file for this entity.
   */
  source: string;

  /**
   * The contents of the source file.
   *
   * This is currently used to check if the TypeScript entrypoint has a default export.
   */
  contents: string;

  /**
   * The name of the entrypoint which is used when displaying errors.
   */
  name: string;

  fields: {
    package: Partial<Record<EntrypointField, string>>;
    exports: Partial<Record<ExportsField, string>>;
    entrypointExports: Partial<Record<ExportsField, string>>;
  };

  /**
   * Check if this is a root entrypoint.
   */
  get isRoot(): boolean {
    return this.path === this.package.path;
  }

  /**
   * The basename of the entrypoint.
   *
   * Example: './src/content.ts' has a base of `content`.
   */
  get baseName(): string {
    return this.isRoot ? '' : path.basename(this.name);
  }

  constructor(props: EntrypointEntityProps) {
    const { json, map, path: jsonPath, source, contents } = props;
    super({
      json,
      map,
      path: jsonPath,
      struct: Entrypoint,
    });
    this.package = props.package;
    this.source = source;
    this.contents = contents;
    this.name = normalizePath(
      path.join(this.package.name, path.relative(this.package.directory, this.directory)),
    );

    this.fields = Object.create({ package: {}, exports: {}, entrypointExports: {} });
    const name = this.isRoot ? 'index' : path.relative(this.package.name, this.name);

    for (const field of this.package.fields) {
      this.fields.package[field] = generateField({
        name,
        type: field,
        output: this.package.output,
        directory: this.directory,
      });
    }

    for (const field of this.package.exportFields) {
      this.fields.exports[field] = generateField({
        name,
        type: exportFieldToPackageField[field],
        output: this.package.output,
        // The directory is relative to the package for the exports object.
        directory: this.package.directory,
      });

      this.fields.entrypointExports[field] = generateField({
        name,
        type: exportFieldToPackageField[field],
        output: this.package.output,
        directory: path.join(this.package.directory, this.baseName),
        alwaysPrefix: true,
      });
    }
  }

  /**
   * Create the json for the entrypoint
   */
  createJson(): Entrypoint {
    const json = { ...this.json };

    for (const key of entrypointFields) {
      const value = this.fields.package[key];

      if (value) {
        json[key] = value;

        // Update the parent package.json for the root entrypoint.
        // TODO this is a side effect.
        if (this.isRoot) {
          this.package.json[key] = value;
        }
      } else {
        Reflect.deleteProperty(json, key);
      }
    }

    const shouldIncludeExports =
      !this.isRoot &&
      this.package.isLibrary &&
      // this.package.monots.addExportsToEntrypoints &&
      !this.package.monots.ignoreExports;

    if (shouldIncludeExports) {
      const exportsObject: Record<string, string | Record<string, any>> = {};
      const value = { ...this.fields.entrypointExports };
      exportsObject['.'] = value;
      exportsObject['./index.js'] = value;
      json.exports = sortKeys(exportsObject, { deep: true });
    }

    return json;
  }

  /**
   * Generate the files.
   */
  async generateDevFiles(): Promise<void> {
    const promises: Array<Promise<void>> = [];

    const generateTypesDevFile = (target: string, relativePath: string) => {
      const promise = fs.mkdir(path.dirname(target), { recursive: true }).then(async () => {
        await fs.writeFile(
          target,
          createTypeScriptContent(
            hasDefaultExport(this.contents),
            relativePath.replace(/\.tsx?$/, '.js'),
          ),
        );
      });

      promises.push(promise);
    };

    const generateEsModuleDevFile = (target: string) => {
      const promise = fs
        .mkdir(path.dirname(target), { recursive: true })
        .then(() => fs.symlink(this.source, target));

      promises.push(promise);
    };

    const generateCommonJsDevFile = (target: string, relativePath: string) => {
      const promise = fs.mkdir(path.dirname(target), { recursive: true }).then(() => {
        const register = path.relative(
          path.dirname(target),
          require.resolve('esbuild-register/dist/node.js'),
        );
        return fs.writeFile(
          target,
          `// Allow the project to be used for commonjs environments \nconst { register } = require('${register}');\n\nconst { unregister } = register({ target: \`node\${process.version.slice(1)}\`})\nmodule.exports = require('${relativePath}');\nunregister();`.trim(),
        );
      });

      promises.push(promise);
    };

    for (const [field, fieldPath] of entries(this.fields.package)) {
      if (!fieldPath) {
        continue;
      }

      const target = path.join(this.directory, fieldPath);
      const relativePath = path.relative(path.dirname(target), this.source);

      if (field === 'types') {
        // Create the TypeScript types when applicable.

        generateTypesDevFile(target, relativePath);
      }

      if (['module', 'browser'].includes(field)) {
        generateEsModuleDevFile(target);
      }

      if (field === 'main') {
        generateCommonJsDevFile(target, relativePath);
      }
    }

    // Packages with `mode` "cli" don't have a `main`, `browser`, `module` or
    // `types` field. They are placed within the `dist/index.js` file.
    if (this.package.isCli) {
      const target = path.join(this.package.output, `${this.baseName || 'index'}.js`);

      if (this.package.json.type === 'module') {
        generateEsModuleDevFile(target);
      } else {
        const relativePath = path.relative(path.dirname(target), this.source);
        generateCommonJsDevFile(target, relativePath);
      }
    }

    await Promise.all(promises);
  }
}

const exportFieldToPackageField: Record<ExportsField, EntrypointField> = {
  types: 'types',
  import: 'module',
  require: 'main',
  browser: 'browser',
  default: 'module',
};
