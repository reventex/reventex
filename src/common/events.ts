import * as t from 'io-ts';

import { NarrowableString, UnionOfTuple } from './types';

export class Events<
  Entities extends [''] | ReadonlyArray<string>,
  EventStoreCollectionName extends string,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<string>
> {
  readonly entities: Entities;
  readonly collectionName: EventStoreCollectionName;
  readonly payloadSchemas: PayloadSchemas;
  readonly eventTypes: EventTypes;

  constructor(
    entities: Entities,
    collectionName: EventStoreCollectionName,
    payloadSchemas: PayloadSchemas,
    eventTypes: EventTypes
  ) {
    this.entities = entities;
    this.collectionName = collectionName;
    this.payloadSchemas = payloadSchemas;
    this.eventTypes = eventTypes;
  }

  define<EventType extends NarrowableString, PayloadSchema extends t.Type<any>>(
    eventType: EventType,
    payloadSchema: PayloadSchema
  ): Events<
    Entities,
    EventStoreCollectionName,
    PayloadSchemas & Record<EventType, PayloadSchema>,
    readonly [...EventTypes, EventType]
  > {
    (this.payloadSchemas as any)[eventType] = payloadSchema;
    (this.eventTypes as any).push(eventType);
    return this as any;
  }
}

export const events = <
  EventStoreCollectionName extends string,
  Entities extends [''] | ReadonlyArray<string>
>(
  collectionName: EventStoreCollectionName,
  entities: Entities
) => new Events(entities, collectionName, {} as const, [] as const);
