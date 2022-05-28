import { createDebugger } from '@monots/utils';
import type { ValueOf } from 'type-fest';

export const DEFAULT_GET_ARGUMENT = () => {};
export const SUPPORTED_EXTENSIONS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'] as const;
export type SupportedExtensions = ValueOf<typeof SUPPORTED_EXTENSIONS, number>;
export const debug = createDebugger('monots:load-esm-config');
