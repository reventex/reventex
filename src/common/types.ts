import type { ClientSession, Collection, ObjectId } from 'mongodb';
import type { EntityId } from './entity-id';

/* Helpers */

export type NarrowableString = string;

export type UnionOfTuple<T extends ReadonlyArray<any>> = T[number];

export type ExcludeFromTuple<T extends ReadonlyArray<any>, E> = T extends readonly [infer F, ...infer R]
  ? F extends E
    ? ExcludeFromTuple<R, E>
    : readonly [F, ...ExcludeFromTuple<R, E>]
  : readonly [];

export type RecordByUnion<Union extends string, U extends Record<Union, any>> = U;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;

export type Push<T extends any[], V> = [...T, V];

export type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : Push<TuplifyUnion<Exclude<T, L>>, L>;

/* io-ts */

export const IO_TS_RUNTIME_TYPE = Symbol();
export const IO_TS_RUNTIME_VALUE = Symbol();
export const IO_TS_COMPILE_TIME_TYPE = Symbol();

export class TClass<T extends any> {
  [IO_TS_COMPILE_TIME_TYPE]: T;
  [IO_TS_RUNTIME_TYPE]: string;
  [IO_TS_RUNTIME_VALUE]: any;
}

export class TString extends TClass<string> {
  [IO_TS_RUNTIME_TYPE] = 'string';
}
export class TNull extends TClass<null> {
  [IO_TS_RUNTIME_TYPE] = 'null';
}
export class TUndefined extends TClass<undefined> {
  [IO_TS_RUNTIME_TYPE] = 'undefined';
}
export class TVoid extends TClass<void> {
  [IO_TS_RUNTIME_TYPE] = 'void';
}
export class TNumber extends TClass<number> {
  [IO_TS_RUNTIME_TYPE] = 'number';
}
export class TBoolean extends TClass<boolean> {
  [IO_TS_RUNTIME_TYPE] = 'boolean';
}
export class TUnknown extends TClass<unknown> {
  [IO_TS_RUNTIME_TYPE] = 'unknown';
}
export class TLiteral<T extends string> extends TClass<T> {
  [IO_TS_RUNTIME_TYPE] = 'literal';
  [IO_TS_RUNTIME_VALUE]: T;
  constructor(value: T) {
    super();
    this[IO_TS_RUNTIME_TYPE] = value;
  }
}
export class TArray<T extends TClass<any>> extends TClass<Array<T[typeof IO_TS_COMPILE_TIME_TYPE]>> {
  [IO_TS_RUNTIME_TYPE] = 'array';
  [IO_TS_RUNTIME_VALUE]: TClass<T>;
  constructor(value: TClass<T>) {
    super();
    this[IO_TS_RUNTIME_VALUE] = value;
  }
}
export class TRecord<T extends Record<any, TClass<any>>> extends TClass<
  { [K in keyof T]: T[K][typeof IO_TS_COMPILE_TIME_TYPE] }
> {
  [IO_TS_RUNTIME_TYPE] = 'record';
  [IO_TS_RUNTIME_VALUE]: T;
  constructor(value: T) {
    super();
    this[IO_TS_RUNTIME_VALUE] = value;
  }
}

export type ExtractCompileTimeType<T extends TClass<any>> = T[typeof IO_TS_COMPILE_TIME_TYPE];

export type ExtractCompileTimeTypes<T extends ReadonlyArray<TClass<any>>> = T extends readonly [infer F, ...infer R]
  ? F extends TClass<any>
    ? R extends ReadonlyArray<TClass<any>>
      ? readonly [ExtractCompileTimeType<F>, ...ExtractCompileTimeTypes<R>]
      : never
    : never
  : T extends Array<any>
  ? Array<any>
  : [];

export class TEntityId<T extends string> extends TClass<EntityId<T>> {
  [IO_TS_RUNTIME_TYPE] = 'entityId';
  [IO_TS_RUNTIME_VALUE]: T;
  constructor(value: T) {
    super();
    this[IO_TS_RUNTIME_TYPE] = value;
  }
}

export type ExtractEntityNames<T extends TClass<any>> = T extends TEntityId<string>
  ? T[typeof IO_TS_RUNTIME_VALUE]
  : T extends TArray<infer P>
  ? ExtractEntityNames<P>
  : T extends TRecord<infer P>
  ? {
      [K in keyof P]: P[K] extends TEntityId<string> ? P[K][typeof IO_TS_RUNTIME_VALUE] : ExtractEntityNames<P[K]>;
    }[keyof P]
  : never;

/* Business logic */

export type TValue = any;
export type TStrictKey = Array<string>;
export type TKey = string;

export type Event<PayloadSchema extends TClass<any>> = {
  timestamp: number;
  type: string;
  payload: ExtractCompileTimeType<PayloadSchema>;
};

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
  EventTypes extends ReadonlyArray<NarrowableString>,
  EventType extends UnionOfTuple<EventTypes>
> = (context: {
  event: Event<PayloadSchemas[EventType]>;
  api: MutationApi;
  documentId: string;
}) => Generator<Effect<EffectTypes>, void, any>;
