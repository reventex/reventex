import type { Db, ClientSession, Collection, ObjectId } from 'mongodb';
import type { Resolver } from '../resolver';
import type { RecordByUnion, RecordFromEntries, UnionOfTuple } from './helpers';
import type { ExtractCompileTimeType, TClass } from '../io';

export type TValue = any;
export type TStrictKey = Array<string>;
export type TKey = string;

export type Event<PayloadSchema extends TClass<any>> = {
  timestamp: number;
  type: string;
  payload: ExtractCompileTimeType<PayloadSchema>;
};

type TupleFromResolvers<T extends ReadonlyArray<Resolver<any, any, any>> | [Resolver<any, any, any>]> = {
  [K in keyof T]: T[K] extends Resolver<any, any, any> ? [T[K]['name'], T[K]] : never;
};
export type RecordFromResolvers<T extends ReadonlyArray<Resolver<any, any, any>>> = RecordFromEntries<
  TupleFromResolvers<T>
>;

export type EventFromClient<
  EventTypes extends ReadonlyArray<string>,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>
> = {
  [K in keyof PayloadSchemas]: K extends string
    ? { type: K; payload: ExtractCompileTimeType<PayloadSchemas[K]> }
    : never;
}[keyof PayloadSchemas];

export type EventFromDatabase = {
  timestamp: number;
  type: string;
  payload: any;
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

export type EventHandler<
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>,
  EventTypes extends ReadonlyArray<string>,
  EventType extends UnionOfTuple<EventTypes>
> = (context: {
  event: Event<PayloadSchemas[EventType]>;
  api: MutationApi;
  documentId: string;
}) => Generator<Effect<EffectTypes>, void, any>;

export type ResolveApi = {
  database: Db;
  session: ClientSession;
  objectId: (id: string) => ObjectId;
};
