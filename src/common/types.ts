import * as t from 'io-ts';

export type NarrowableString = string;

export type UnionOfTuple<T extends ReadonlyArray<any>> = T[number];

export type ExcludeFromTuple<T extends ReadonlyArray<any>, E> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends E
    ? ExcludeFromTuple<R, E>
    : readonly [F, ...ExcludeFromTuple<R, E>]
  : readonly [];

export type TypesOf<T extends ReadonlyArray<t.Any>> = T extends readonly [infer F, ...infer R]
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

export type EffectKVS<
  EffectName extends EffectNames,
  Key extends any,
  Value extends any,
  Specifier extends any
> = { effectName: EffectName; key: Key; value?: Value; specifier?: Specifier };

export type EffectKV<
  EffectName extends EffectNames,
  Key extends any,
  Value extends any
> = EffectKVS<EffectName, Key, Value, never>;

export type EffectK<EffectName extends EffectNames, Key extends any> = EffectKVS<
  EffectName,
  Key,
  never,
  never
>;

type EffectCreator<
  EffectName extends EffectNames,
  Args extends [any] | [any, any] | [any, any, any]
> = Args extends [infer Key]
  ? Record<EffectName, (key: Key) => EffectK<EffectName, Key>>
  : Args extends [infer Key, infer Value]
  ? Record<EffectName, (key: Key, value: Value) => EffectKV<EffectName, Key, Value>>
  : Args extends [infer Key, infer Value, infer Specifier]
  ? Record<
      EffectName,
      (key: Key, value: Value, specifier: Specifier) => EffectKVS<EffectName, Key, Value, Specifier>
    >
  : never;

export type EffectNames = 'get' | 'set';

export type RecordByEffectNames<U extends Record<EffectNames, any>> = U;

export type MutationApi = RecordByEffectNames<
  EffectCreator<'get', [string]> & EffectCreator<'set', [string, any]>
>;

export const mutationApi: MutationApi = {
  get(key: string) {
    return {
      effectName: 'get',
      key,
    };
  },
  set(key: string, value: any) {
    return {
      effectName: 'set',
      key,
      value,
    };
  },
};
