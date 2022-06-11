export type AnyFunction<Arguments extends any[] = any[], Returns = any> = (
  ...args: Arguments
) => Returns;
