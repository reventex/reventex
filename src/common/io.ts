import type { TuplifyUnion, UnionOfTuple } from './types/helpers';
import type { EntityId } from './entity-id';

export type BoxifyTuple<T extends ReadonlyArray<TClass<any>> | [TClass<any>]> = {
  [P in keyof T]: T[P] extends TClass<any> ? ExtractCompileTimeType<T[P]> : never;
};

export type ExtractCompileTimeType<T extends TClass<any>> = T[typeof IO_TS_COMPILE_TIME_TYPE];

export type ExtractCompileTimeTypes<T extends ReadonlyArray<TClass<any>> | [TClass<any>]> = BoxifyTuple<T> extends
  | ReadonlyArray<any>
  | [any]
  ? BoxifyTuple<T>
  : never;

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

export class TUnion<T extends ReadonlyArray<TClass<any>> | [TClass<any>]> extends TClass<
  UnionOfTuple<ExtractCompileTimeTypes<T>>
> {
  [IO_TS_RUNTIME_TYPE] = 'union';
  [IO_TS_RUNTIME_VALUE]: T;
  constructor(value: T) {
    super();
    this[IO_TS_RUNTIME_VALUE] = value;
  }
}

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

export const t = {
  null: new TNull(),
  undefined: new TUndefined(),
  void: new TVoid(),
  string: new TString(),
  number: new TNumber(),
  boolean: new TBoolean(),
  unknown: new TUnknown(),
  entityId: <EntityName extends string>(entityName: EntityName): TEntityId<EntityName> => new TEntityId(entityName),
  literal: <Type extends string>(value: Type): TLiteral<Type> => new TLiteral(value),
  array: <Type extends TClass<any>>(schema: Type): TArray<Type> => new TArray(schema),
  type: <Type extends Record<string, TClass<any>>>(schema: Type): TRecord<Type> => new TRecord(schema),
  union: <Type extends ReadonlyArray<TClass<any>> | [TClass<any>]>(schema: Type) => new TUnion(schema),
};

function optionalAddEntityName(entityNames: Array<string>, schema: TClass<any> | undefined): void {
  if (schema == null) {
    return;
  }
  switch (schema[IO_TS_RUNTIME_TYPE]) {
    case 'record': {
      const runtimeValue = schema[IO_TS_RUNTIME_VALUE];
      for (const key in runtimeValue) {
        if (Object.prototype.hasOwnProperty.call(runtimeValue, key)) {
          optionalAddEntityName(entityNames, runtimeValue[key]);
        }
      }
      break;
    }
    case 'array': {
      const runtimeValue = schema[IO_TS_RUNTIME_VALUE];
      for (let index = 0; index < runtimeValue.length; index++) {
        optionalAddEntityName(entityNames, runtimeValue[index]);
      }
      break;
    }
    case 'entityId': {
      entityNames.push(schema[IO_TS_RUNTIME_VALUE]);
      break;
    }
  }
}

export function extractEntityNamesFromSchema<T extends TClass<any>>(schema: T): TuplifyUnion<ExtractEntityNames<T>> {
  const entityNames: Array<string> = [];
  optionalAddEntityName(entityNames, schema);
  Object.freeze(entityNames);
  return entityNames as any;
}
