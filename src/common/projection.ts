import * as t from 'io-ts';

import { IndexDirection } from 'mongodb';

import { UnionOfTuple, ExcludeFromTuple, EventHandler } from './types';
import { Events } from './events';

export class Projection<
  Entities extends [''] | ReadonlyArray<string>,
  EventStoreCollectionName extends string,
  ProjectionName extends UnionOfTuple<Entities>,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<string>
> {
  readonly name: ProjectionName;
  readonly events: Events<Entities,EventStoreCollectionName, PayloadSchemas, EventTypes>;
  readonly handlers: Record<
    UnionOfTuple<EventTypes>,
    EventHandler<PayloadSchemas, EventTypes, any>
  >;
  readonly indexes: Array<[string, IndexDirection]> = [];

  constructor(
    name: ProjectionName,
    events: Events<Entities,EventStoreCollectionName, PayloadSchemas, EventTypes>,
    handlers: Record<UnionOfTuple<EventTypes>, any> = {} as any
  ) {
    this.name = name;
    this.events = events;
    this.handlers = handlers;
  }

  index(
    indexSpec: [string, IndexDirection]
  ): Projection<Entities, EventStoreCollectionName, ProjectionName, PayloadSchemas, EventTypes> {
    this.indexes.push(indexSpec);
    return this;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: EventHandler<PayloadSchemas, EventTypes, EventType>
  ): Projection<
    Entities,
    EventStoreCollectionName,
    ProjectionName,
    PayloadSchemas,
    ExcludeFromTuple<EventTypes, EventType>
  > {
    this.handlers[eventType] = handler;
    return this as any;
  }
}

export function projection<
  Entities extends [''] | ReadonlyArray<string>,
  EventStoreCollectionName extends string,
  ProjectionName extends UnionOfTuple<Entities>,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<string>
>(
  name: ProjectionName,
  events: Events<Entities, EventStoreCollectionName, PayloadSchemas, EventTypes>
): Projection<Entities, EventStoreCollectionName, ProjectionName, PayloadSchemas, EventTypes> {
  return new Projection<Entities, EventStoreCollectionName, ProjectionName, PayloadSchemas, EventTypes>(
    name,
    events
  );
}
