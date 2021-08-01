import {
  TuplifyUnion,
  ExtractEntityNames,
  TEntityId,
  TArray,
  TBoolean,
  TUnknown,
  TNull,
  TNumber,
  TLiteral,
  TRecord,
  TClass,
  TString,
  TVoid,
  TUndefined,
  IO_TS_RUNTIME_VALUE,
  IO_TS_RUNTIME_TYPE,
  TUnion,
} from './types';

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
