import is from '@sindresorhus/is';
import path from 'node:path';
import * as t from 'superstruct';
import { writeJsonFile } from 'write-json-file';

import { compareOutput, FatalError } from '../helpers/index.js';
import type { BaseData } from '../structs.js';

export interface BaseEntityProps<JsonData extends BaseData> {
  /**
   * The `package.json` file path.
   */
  path: string;

  /**
   * The json stored in the package.json represented by this entity.
   */
  json: JsonData;

  /**
   * The shared map of json data across all entities.
   */
  map: Map<string, BaseData>;
}

type WithStruct<Type> = Type extends BaseEntityProps<infer Data>
  ? Type & { struct: t.Describe<Data> }
  : Type;

/**
 * All entities represent a package.json file. The [[`JsonData`]] generic refers
 * to data that needs to be included in the `package.json` file.
 *
 * There are three kinds of entity:
 * - `ProjectEntity` - this is the entity that sits at the root of the project.
 *   It configures the settings for the rest of the project.
 * - `PackageEntity` - This is the per package configuration. Each package can
 *   configure the build options and entrypoints to use.
 *
 * @template JsonData - The data for the package.json file.
 */
export abstract class BaseEntity<JsonData extends BaseData> {
  sharedMap: Map<string, BaseData>;
  struct: t.Describe<JsonData>;
  path: string;
  directory: string;
  abstract get name(): string;

  get json(): JsonData {
    const json = this.sharedMap.get(this.path);

    // TODO format the error that is thrown when invalid.
    t.assert(json, this.struct);

    return json;
  }

  set json(json: JsonData) {
    // TODO format the error that is thrown when data is used.
    t.assert(json, this.struct);
    this.sharedMap.set(this.path, json);
  }

  constructor(props: WithStruct<BaseEntityProps<JsonData>>) {
    this.struct = props.struct;
    this.path = props.path;
    this.directory = path.dirname(props.path);
    this.sharedMap = props.map;

    if (!props.map.has(this.path)) {
      props.map.set(this.path, props.json);
    }
  }

  /**
   * Create the up to date JsonData.
   */
  abstract createJson(): JsonData;

  /**
   * Persist the json data at the given path.
   *
   * This will return `true` when a fix is made.
   */
  async saveJson(props: SaveJsonProps = {}): Promise<boolean> {
    const { fix = true, errors = [] } = props;
    const actual = this.json;
    const expected = this.createJson();

    if (is.emptyObject(expected.monots)) {
      // Remove empty `monots` configuration object.
      Reflect.deleteProperty(expected, 'monots');
    }

    const output = compareOutput({ actual, expected, name: this.name });

    if (is.emptyArray(output)) {
      return false;
    }

    if (fix) {
      await writeJsonFile(this.path, expected, { detectIndent: true });
    } else {
      errors.push(...output);
    }

    return true;
  }
}

export interface SaveJsonProps {
  fix?: boolean;
  errors?: FatalError[];
}
