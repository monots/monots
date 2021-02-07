import detectIndent from 'detect-indent';
import * as fs from 'fs-extra';
import parseJson from 'parse-json';
import nodePath from 'path';

import { JSONValue } from './utils';

type JSONDataByPath = Map<string, { value: JSONValue; stringifiedSaved: string }>;

type BaseConfig = Record<string, JSONValue | undefined> & {
  monots?: JSONValue;
};

export class Item<JSONData extends BaseConfig = BaseConfig> {
  path: string;
  indent: string;
  directory: string;
  _jsonDataByPath: JSONDataByPath;
  constructor(filePath: string, contents: string, jsonDataByPath: JSONDataByPath) {
    this.indent = detectIndent(contents).indent || '  ';
    this.path = filePath;
    this.directory = nodePath.dirname(filePath);
    this._jsonDataByPath = jsonDataByPath;

    if (!jsonDataByPath.has(this.path)) {
      const json = parseJson(contents, filePath);
      jsonDataByPath.set(this.path, {
        value: json,
        stringifiedSaved: JSON.stringify(json),
      });

      if (!this.json.monots) {
        this.json.monots = {};
      }
    }
  }

  get json() {
    return this._jsonDataByPath.get(this.path)!.value as JSONData;
  }

  set json(value) {
    this._jsonDataByPath.set(this.path, {
      value,
      stringifiedSaved: this._jsonDataByPath.get(this.path)!.stringifiedSaved,
    });
  }
  async save() {
    const json = { ...this.json };

    if (
      json.monots &&
      json.monots !== null &&
      typeof json.monots === 'object' &&
      !Object.keys(json.monots).length
    ) {
      delete json.monots;
    }

    const stringified = JSON.stringify(json);

    if (stringified !== this._jsonDataByPath.get(this.path)!.stringifiedSaved) {
      await fs.writeFile(this.path, `${JSON.stringify(json, null, this.indent)}\n`);
      return true;
    }

    return false;
  }
}
