import * as t from 'io-ts';

import { NarrowableString, TypesOf } from './types';

export class Resolver<
  ResolverName extends NarrowableString,
  Args extends ReadonlyArray<t.Any>,
  Result extends t.Any
> {
  name: ResolverName;
  inputSchema: Args;
  outputSchema: Result;
  implementation: (...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>;

  constructor(
    name: ResolverName,
    inputSchema: Args,
    outputSchema: Result,
    implementation: (...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>,
  ) {
    this.name = name;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.implementation = implementation;
  }
}

export function resolver<ResolverName extends NarrowableString>(name: ResolverName) {
  return {
    withArgs<Args extends ReadonlyArray<t.Any>>(...inputSchemas: Args) {
      return {
        returns<Result extends t.Any>(outputSchema: Result) {
          return {
            implements(implementation: (...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>) {
              return new Resolver<ResolverName, Args, Result>(
                name,
                inputSchemas,
                outputSchema,
                implementation,
              );
            },
          };
        },
      };
    },
  };
}
