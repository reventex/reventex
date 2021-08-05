import type { ResolveApi, RecordFromResolvers } from './types/event-sourcing';
import type { ExtractCompileTimeTypes, ExtractCompileTimeType, TClass } from './io';

export function recordOfResolvers<
  Resolvers extends
    | ReadonlyArray<Resolver<string, ReadonlyArray<TClass<any>>, TClass<any>>>
    | [Resolver<string, ReadonlyArray<TClass<any>>, TClass<any>>]
>(resolvers: Resolvers): RecordFromResolvers<Resolvers> {
  return resolvers.reduce((acc: any, val) => {
    acc[val.name] = val;
    return acc;
  }, {} as any);
}

export class Resolver<
  ResolverName extends string,
  Args extends ReadonlyArray<TClass<any>> | [TClass<any>],
  Result extends TClass<any>
> {
  name: ResolverName;
  inputSchema: Args;
  outputSchema: Result;
  implementation: (api: ResolveApi, ...args: ExtractCompileTimeTypes<Args>) => Promise<ExtractCompileTimeType<Result>>;

  constructor(
    name: ResolverName,
    inputSchema: Args,
    outputSchema: Result,
    implementation: (api: ResolveApi, ...args: ExtractCompileTimeTypes<Args>) => Promise<ExtractCompileTimeType<Result>>
  ) {
    this.name = name;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.implementation = implementation;
  }
}

export function resolver<ResolverName extends string>(name: ResolverName) {
  return {
    withArgs<Args extends ReadonlyArray<TClass<any>> | [TClass<any>]>(...inputSchemas: Args) {
      return {
        returns<Result extends TClass<any>>(outputSchema: Result) {
          return {
            implements(
              implementation: (
                api: ResolveApi,
                ...args: ExtractCompileTimeTypes<Args>
              ) => Promise<ExtractCompileTimeType<Result>>
            ) {
              return new Resolver<ResolverName, Args, Result>(name, inputSchemas, outputSchema, implementation);
            },
          };
        },
      };
    },
  };
}
