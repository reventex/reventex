import type { IndexDirection } from 'mongodb';

import { UnionOfTuple, ExcludeFromTuple, EventHandler, ExtractEntityNames, TRecord, TClass } from './types';
import { Events } from './events';

export class Projection<
  EventStoreCollectionName extends string,
  ProjectionName extends ExtractEntityNames<TRecord<PayloadSchemas>>,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>,
  EventTypes extends ReadonlyArray<string>
> {
  readonly name: ProjectionName;
  readonly events: Events<EventStoreCollectionName, PayloadSchemas, EventTypes>;
  readonly handlers: Record<UnionOfTuple<EventTypes>, EventHandler<PayloadSchemas, EventTypes, any>>;
  readonly indexes: Array<[string, IndexDirection]> = [];

  constructor(
    name: ProjectionName,
    events: Events<EventStoreCollectionName, PayloadSchemas, EventTypes>,
    handlers: Record<UnionOfTuple<EventTypes>, any> = {} as any
  ) {
    this.name = name;
    this.events = events;
    this.handlers = handlers;
  }

  index(
    indexSpec: [string, IndexDirection]
  ): Projection<EventStoreCollectionName, ProjectionName, PayloadSchemas, EventTypes> {
    this.indexes.push(indexSpec);
    return this;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: EventHandler<PayloadSchemas, EventTypes, EventType>
  ): Projection<EventStoreCollectionName, ProjectionName, PayloadSchemas, ExcludeFromTuple<EventTypes, EventType>> {
    this.handlers[eventType] = handler;
    return this as any;
  }
}

export function projection<
  EventStoreCollectionName extends string,
  ProjectionName extends ExtractEntityNames<TRecord<PayloadSchemas>>,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>,
  EventTypes extends ReadonlyArray<string>
>(
  name: ProjectionName,
  events: Events<EventStoreCollectionName, PayloadSchemas, EventTypes>
): Projection<EventStoreCollectionName, ProjectionName, PayloadSchemas, EventTypes> {
  return new Projection<EventStoreCollectionName, ProjectionName, PayloadSchemas, EventTypes>(name, events);
}
