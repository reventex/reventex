import type { UnionOfTuple, TuplifyUnion } from './types/helpers';
import type { ExtractEntityNames, TClass, TRecord } from './io';
import { t, extractEntityNamesFromSchema } from './io';

export class Events<
  EventStoreCollectionName extends string,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>,
  EventTypes extends ReadonlyArray<string>
> {
  readonly collectionName: EventStoreCollectionName;
  readonly payloadSchemas: PayloadSchemas;
  readonly eventTypes: EventTypes;

  get entityNames(): TuplifyUnion<ExtractEntityNames<TRecord<PayloadSchemas>>> {
    return extractEntityNamesFromSchema(t.type(this.payloadSchemas));
  }

  constructor(collectionName: EventStoreCollectionName, payloadSchemas: PayloadSchemas, eventTypes: EventTypes) {
    this.collectionName = collectionName;
    this.payloadSchemas = payloadSchemas;
    this.eventTypes = eventTypes;
  }

  define<EventType extends string, PayloadSchema extends TClass<any>>(
    eventType: EventType,
    payloadSchema: PayloadSchema
  ): Events<
    EventStoreCollectionName,
    PayloadSchemas & Record<EventType, PayloadSchema>,
    readonly [...EventTypes, EventType]
  > {
    (this.payloadSchemas as any)[eventType] = payloadSchema;
    (this.eventTypes as any).push(eventType);
    return this as any;
  }
}

export const events = <EventStoreCollectionName extends string>(collectionName: EventStoreCollectionName) =>
  new Events(collectionName, {} as const, [] as const);
