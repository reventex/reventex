import type { TClass, ExtractCompileTimeType } from './io';

export function validate<T extends TClass<any>>(schema: T, params: any, errorName?: string): ExtractCompileTimeType<T> {
  void errorName;
  return params;
}
