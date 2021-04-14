import * as t from 'io-ts';

export type NarrowableString = string | number | symbol;

export type UnionOfTuple<T extends ReadonlyArray<any>> = T[number];

export type ExcludeFromTuple<
  T extends ReadonlyArray<any>,
  E
> = T extends readonly [infer F, ...infer R]
  ? F extends E
    ? ExcludeFromTuple<R, E>
    : readonly [F, ...ExcludeFromTuple<R, E>]
  : readonly [];

export type TypesOf<T extends ReadonlyArray<t.Any>> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends t.Any
    ? R extends ReadonlyArray<t.Any>
      ? readonly [t.TypeOf<F>, ...TypesOf<R>]
      : never
    : never
  : [];

export type Event<PayloadSchema extends t.Any> = {
  timestamp: number;
  payload: t.TypeOf<PayloadSchema>;
};

export type MutationApi = {
  get(key: string): string;
};
