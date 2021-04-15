import * as t from 'io-ts';

/* Helpers */

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

export type EffectKVS<
  Type extends EffectTypes,
  Key extends any,
  Value extends any,
  SliceSize extends any
> = { type: Type; key: Key; value?: Value; sliceSize?: SliceSize };

export type EffectKV<Type extends EffectTypes, Key extends any, Value extends any> = EffectKVS<
  Type,
  Key,
  Value,
  never
>;

export type EffectK<Type extends EffectTypes, Key extends any> = EffectKVS<Type, Key, never, never>;

type EffectCreator<
  EffectName extends EffectTypes,
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

export type RecordByUnion<Union extends string, U extends Record<Union, any>> = U;

/* Business logic */

export type Event<PayloadSchema extends t.Any> = {
  timestamp: number;
  payload: t.TypeOf<PayloadSchema>;
};

export type EffectTypes =
  | 'set'
  | 'remove'
  | 'merge'
  | 'setMaximum'
  | 'setMinimum'
  | 'increment'
  | 'decrement'
  | 'multiply'
  | 'divide'
  | 'rename'
  | 'addToSet'
  | 'pushFront'
  | 'popFront'
  | 'pushBack'
  | 'popBack'
  | 'pullEQ'
  | 'pullGT'
  | 'pullGTE'
  | 'pullLT'
  | 'pullLTE'
  | 'pullNE'
  | 'pullIN'
  | 'pullNIN'
  | 'get';

export type TValue = any;
export type TStrictKey = Array<string>;
export type TKey = string | Array<string>;

export type MutationApi = RecordByUnion<
  EffectTypes,
  EffectCreator<'set', [TKey, any]> &
    EffectCreator<'remove', [TKey]> &
    EffectCreator<'merge', [TKey, any]> &
    EffectCreator<'setMaximum', [TKey, number]> &
    EffectCreator<'setMinimum', [TKey, number]> &
    EffectCreator<'increment', [TKey, number]> &
    EffectCreator<'decrement', [TKey, number]> &
    EffectCreator<'multiply', [TKey, number]> &
    EffectCreator<'divide', [TKey, number]> &
    EffectCreator<'rename', [TKey, TKey]> &
    EffectCreator<'addToSet', [TKey, any]> &
    EffectCreator<'pushFront', [TKey, any]> &
    EffectCreator<'popFront', [TKey, any]> &
    EffectCreator<'pushBack', [TKey, any]> &
    EffectCreator<'popBack', [TKey, any]> &
    EffectCreator<'pullEQ', [TKey, any]> &
    EffectCreator<'pullGT', [TKey, any]> &
    EffectCreator<'pullGTE', [TKey, any]> &
    EffectCreator<'pullLT', [TKey, any]> &
    EffectCreator<'pullLTE', [TKey, any]> &
    EffectCreator<'pullNE', [TKey, any]> &
    EffectCreator<'pullIN', [TKey, any]> &
    EffectCreator<'pullNIN', [TKey, any]> &
    EffectCreator<'get', [TKey]>
>;

// export const mutationApi: MutationApi = {
//   get(key) {
//     return {
//       type: 'get',
//       key,
//     };
//   },
//   set(key, value) {
//     return {
//       type: 'set',
//       key,
//       value,
//     };
//   },
// };
