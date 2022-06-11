import type {
  BasePluginProps,
  MaybePromise,
  MonotsConfig,
  MonotsEvents,
  PluginProps,
  ResolvedMonotsConfig,
} from '@monots/types';
import type { Emitter } from '@monots/utils';
import type { Consola, ExportedConfig, LoadEsmConfigOptions } from 'load-esm-config';
import type { Except, RemoveIndexSignature, TsConfigJson as BaseTsConfigJson } from 'type-fest';

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

type MonotsEventsAlias = MonotsEvents;

/**
 * The main emitter used by the monots package.
 */
export type MonotsEmitter = Emitter<RemoveIndexSignature<MonotsEventsAlias>>;

/**
 * The props that can be used when defining a monots configuration.
 */
export type DefineMonotsConfig = ExportedConfig<MonotsConfig, DefineConfigArgument>;
export type LoadConfigProps = Except<LoadEsmConfigOptions, 'name' | 'getArgument'>;
export interface DefineConfigArgument extends EmitterProps {}
export type EmitterProps = Pick<MonotsEmitter, 'on' | 'emit'>;
export type ResolvedAlias = ResolvedMonotsConfig;
export type PartialResolvedConfig = Omit<Partial<ResolvedMonotsConfig>, keyof BasePluginProps>;

declare global {
  namespace monots {
    interface CommandContext extends EmitterProps {}
    interface ResolvedConfig extends EmitterProps {}
    interface Events {
      /**
       * Gather the resolved configuration properties.
       *
       * Use this to add new properties to the `ResolvedMonotsConfig` object.
       */
      'core:prepare': (props: PluginProps) => MaybePromise<PartialResolvedConfig | void>;

      /**
       * All plugins have been initialized and the resolved configuration is
       * provided within this event.
       */
      'core:ready': (props: ResolvedAlias) => MaybePromise<void>;

      /**
       * Called when everything is completed and cleanup is done.
       */
      'core:dispose': (props: ResolvedAlias) => MaybePromise<void>;
    }
  }
}

declare module '@monots/types' {
  export interface PluginProps extends EmitterProps {
    /**
     * An instance of the logger
     */
    logger: Consola;
  }
}
