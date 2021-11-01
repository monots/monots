import { parse } from '@swc/core';
import type { InputOptions } from '@swc/register/lib/node';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import normalizePath from 'normalize-path';

import { createTypeScriptContent, entries, generateField } from '../helpers/index.js';
import {
  Entrypoint,
  Entrypoint,
  EntrypointField,
  entrypointFields,
  ExportsField,
} from '../schema.js';
import { BaseEntity, BaseEntityProps } from './base-entity.js';
import type { PackageEntity } from './package-entity.js';

/**
 * @internal
 */
export const _require = createRequire(import.meta.url);

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

    this.fields = Object.create({ package: {}, exports: {} });
    const name = this.isRoot ? 'index' : path.relative(this.package.name, this.name);

    for (const field of this.package.fields) {
      this.fields.package[field] = generateField({
        name,
        type: field,
        dist: this.package.dist,
        directory: this.directory,
      });
    }

    for (const field of this.package.exportFields) {
      this.fields.exports[field] = generateField({
        name,
        type: exportFieldToPackageField[field],
        dist: this.package.dist,
        // The directory is relative to the package for the exports object.
        directory: this.package.directory,
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

    return json;
  }

  /**
   * Will return true if the entrypoint has a default export.
   */
  async hasDefaultExport(): Promise<boolean> {
    if (!/(export\s*{[^}]*default|export\s+(|\*\s+as\s+)default\s)/.test(this.contents)) {
      // This definitely doesn't have an export statement.
      return false;
    }

    const ast = await parse(this.contents, {
      target: 'es2015',
      syntax: 'typescript',
      decorators: true,
      dynamicImport: true,
      tsx: path.extname(this.source) === 'tsx',
    });

    for (const statement of ast.body) {
      if (
        statement.type === 'ExportDefaultDeclaration' ||
        (statement.type === 'ExportNamedDeclaration' &&
          statement.specifiers.some(
            (specifier) =>
              (specifier.type === 'ExportDefaultSpecifier' ||
                specifier.type === 'ExportSpecifier') &&
              specifier.exported.value === 'default',
          ))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate the files.
   */
  async generateDevFiles(): Promise<void> {
    const promises: Array<Promise<void>> = [];

    for (const [field, fieldPath] of entries(this.fields.package)) {
      if (!fieldPath) {
        continue;
      }

      const target = path.join(this.directory, fieldPath);
      const relativePath = path.relative(path.dirname(target), this.source);

      if (field === 'types') {
        // Create the TypeScript types when applicable.

        promises.push(
          this.hasDefaultExport().then((hasDefaultExport) =>
            fs
              .mkdir(path.dirname(target), { recursive: true })
              .then(() =>
                fs.writeFile(
                  target,
                  createTypeScriptContent(hasDefaultExport, relativePath.replace(/.tsx?$/, '')),
                ),
              ),
          ),
        );
      }

      if (['module', 'browser'].includes(field)) {
        promises.push(
          fs
            .mkdir(path.dirname(target), { recursive: true })
            .then(() => fs.symlink(this.source, target)),
        );
      }

      if (field === 'main') {
        const config: InputOptions = {
          rootMode: 'upward-optional',
          module: { type: 'commonjs' },
          jsc: { target: 'es2015' },
        };

        promises.push(
          fs
            .mkdir(path.dirname(target), { recursive: true })
            .then(() =>
              fs.writeFile(
                target,
                `// Allow the project to be used for commonjs environments \nconst register = require('${path.relative(
                  path.dirname(target),
                  _require.resolve('@swc/register'),
                )}');\n\nregister(${JSON.stringify(
                  config,
                  undefined,
                  2,
                )})\nmodule.exports = require('${relativePath}');\nregister.revert();`,
              ),
            ),
        );
      }
    }

    await Promise.all(promises);
  }
}

const exportFieldToPackageField: Record<ExportsField, EntrypointField> = {
  import: 'module',
  require: 'main',
  browser: 'browser',
  types: 'types',
  default: 'module',
};
