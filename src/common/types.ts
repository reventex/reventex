import * as t from 'io-ts';
import { ClientSession, Collection, ObjectId } from 'mongodb';

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

export type RecordByUnion<Union extends string, U extends Record<Union, any>> = U;

/* Business logic */

export type TValue = any;
export type TStrictKey = Array<string>;
export type TKey = string;

export type Event<PayloadSchema extends t.Any> = {
  timestamp: number;
  payload: t.TypeOf<PayloadSchema>;
};

export type Effect<EffectType extends EffectTypes> = {
  type: EffectType;
  key: TStrictKey;
  value?: TValue;
  sliceSize?: number;
};

type EffectCreator<EffectType extends EffectTypes, Args extends Array<any>> = Record<
  EffectType,
  (...args: Args) => Effect<EffectType>
>;

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

export type MutationApi = RecordByUnion<
  EffectTypes,
  EffectCreator<'set', [string, any] | [any]> &
    EffectCreator<'remove', [string] | []> &
    EffectCreator<'merge', [string, any] | [any]> &
    EffectCreator<'setMaximum', [string, number]> &
    EffectCreator<'setMinimum', [string, number]> &
    EffectCreator<'increment', [string, number]> &
    EffectCreator<'decrement', [string, number]> &
    EffectCreator<'multiply', [string, number]> &
    EffectCreator<'divide', [string, number]> &
    EffectCreator<'rename', [string, string]> &
    EffectCreator<'addToSet', [string, any]> &
    EffectCreator<'pushFront', [string, any]> &
    EffectCreator<'popFront', [string]> &
    EffectCreator<'pushBack', [string, any]> &
    EffectCreator<'popBack', [string]> &
    EffectCreator<'pullEQ', [string, any]> &
    EffectCreator<'pullGT', [string, any]> &
    EffectCreator<'pullGTE', [string, any]> &
    EffectCreator<'pullLT', [string, any]> &
    EffectCreator<'pullLTE', [string, any]> &
    EffectCreator<'pullNE', [string, any]> &
    EffectCreator<'pullIN', [string, any]> &
    EffectCreator<'pullNIN', [string, any]> &
    EffectCreator<'get', [string] | []>
>;

export type ImmutableContext = { state: any };

export type MongoContext = {
  session: ClientSession;
  collection: Collection;
  documentId: ObjectId;
};
