import type {
  BaseMonotsResolvedConfig,
  MonotsConfig,
  MonotsEvents,
  ResolvedMonotsConfig,
} from '@monots/types';
import type { Emitter } from '@monots/utils';
import type { ExportedConfig, LoadEsmConfigOptions, LoadEsmConfigResult } from 'load-esm-config';
import type { Except, TsConfigJson as BaseTsConfigJson } from 'type-fest';

/**
 * Matches a JSON object.
 *
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.
 *
 * @category Basic
 */
export type JsonObject = { [Key in string]?: JsonValue };

/**
 * Matches a JSON array.
 *
 * @category Basic
 */
export type JsonArray = JsonValue[];

/**
 * Matches any valid JSON primitive value.
 *
 * @category Basic
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Matches any valid JSON value.
 *
 * @see `Jsonify` if you need to transform a type to one that is assignable to `JsonValue`.
 *
 * @category Basic
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type TsConfigJson = BaseTsConfigJson & { 'ts-node'?: BaseTsConfigJson } & JsonObject;
export type References = BaseTsConfigJson.References & JsonObject;

type Mapped<Type> = { [Key in keyof Type]: Type[Key] };

/**
 * The main emitter used by the monots package.
 */
export type MonotsEmitter = Emitter<Mapped<MonotsEvents>>;

/**
 * The props that can be used when defining a monots configuration.
 */
export type DefineMonotsConfig = ExportedConfig<MonotsConfig, DefineConfigArgument>;
export type LoadConfigProps = Except<LoadEsmConfigOptions, 'name' | 'getArgument'>;
export interface DefineConfigArgument extends Pick<MonotsEmitter, 'on' | 'emit'> {}
export type GenerateResolvedConfig = Except<
  Partial<ResolvedMonotsConfig>,
  keyof BaseMonotsResolvedConfig
>;

declare module '@monots/types' {
  export interface ConfigLoadedProps extends LoadEsmConfigResult<MonotsConfig> {}

  export interface MonotsEvents {
    /**
     * Gather the resolved configuration properties.
     *
     * Use this to add new properties to the `ResolvedMonotsConfig` object.
     */
    'config:pre:resolve': (props: ConfigLoadedProps) => Promise<GenerateResolvedConfig>;

    /**
     * Receive all the resolved configuration properties.
     */
    'config:post:resolve': (props: ResolvedMonotsConfig) => Promise<void>;
  }
}
