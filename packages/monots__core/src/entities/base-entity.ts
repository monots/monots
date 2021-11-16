import { removeUndefined } from '@monots/utils';
import is from '@sindresorhus/is';
import path from 'node:path';
import * as t from 'superstruct-extra';
import { writeJsonFile } from 'write-json-file';

import { compareOutput, FatalError } from '../helpers/index.js';

interface BaseData {
  [key: string]: unknown;
}

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

  #populatedJson?: JsonData;
  get populatedJson(): JsonData {
    if (this.#populatedJson) {
      return this.#populatedJson;
    }

    const json = this.sharedMap.get(this.path);

    this.#populatedJson = t.create(json, this.struct);

    return this.#populatedJson;
  }

  #json?: JsonData;
  get json(): JsonData {
    if (this.#json) {
      return this.#json;
    }

    const json = this.sharedMap.get(this.path);
    this.struct.assert(json);

    this.#json = json;
    return json;
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
    const actual = removeUndefined(this.json);
    const expected = removeUndefined(this.createJson());

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
