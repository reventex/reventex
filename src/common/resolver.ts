import * as t from 'io-ts';
import { Db, ClientSession } from 'mongodb';

import { NarrowableString, TypesOf } from './types';

type ResolveApi = {
  database: Db;
  session: ClientSession;
};

export class Resolver<
  ResolverName extends NarrowableString,
  Args extends ReadonlyArray<t.Any>,
  Result extends t.Any
> {
  name: ResolverName;
  inputSchema: Args;
  outputSchema: Result;
  implementation: (api: ResolveApi, ...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>;

  constructor(
    name: ResolverName,
    inputSchema: Args,
    outputSchema: Result,
    implementation: (api: ResolveApi, ...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>
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
            implements(
              implementation: (api: ResolveApi, ...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>
            ) {
              return new Resolver<ResolverName, Args, Result>(
                name,
                inputSchemas,
                outputSchema,
                implementation
              );
            },
          };
        },
      };
    },
  };
}
