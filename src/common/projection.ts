import * as t from 'io-ts';

import { IndexDirection } from 'mongodb';

import { NarrowableString, UnionOfTuple, ExcludeFromTuple, EventHandler } from './types';
import { Events } from './events';

export class Projection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
> {
  readonly name: ProjectionName;
  readonly events: Events<PayloadSchemas, EventTypes>;
  readonly handlers: Record<
    UnionOfTuple<EventTypes>,
    EventHandler<PayloadSchemas, EventTypes, any>
  >;
  readonly indexes: Array<[string, IndexDirection]> = [];

  constructor(
    name: ProjectionName,
    events: Events<PayloadSchemas, EventTypes>,
    handlers: Record<UnionOfTuple<EventTypes>, any> = {} as any
  ) {
    this.name = name;
    this.events = events;
    this.handlers = handlers;
  }

  index(
    indexSpec: [string, IndexDirection]
  ): Projection<ProjectionName, PayloadSchemas, EventTypes> {
    this.indexes.push(indexSpec);
    return this;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: EventHandler<PayloadSchemas, EventTypes, EventType>
  ): Projection<ProjectionName, PayloadSchemas, ExcludeFromTuple<EventTypes, EventType>> {
    this.handlers[eventType] = handler;
    return this as any;
  }
}

export function projection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
>(
  name: ProjectionName,
  events: Events<PayloadSchemas, EventTypes>
): Projection<ProjectionName, PayloadSchemas, EventTypes> {
  return new Projection<ProjectionName, PayloadSchemas, EventTypes>(name, events);
}
