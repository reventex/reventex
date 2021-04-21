import * as t from 'io-ts';

import {
  Event,
  MutationApi,
  NarrowableString,
  UnionOfTuple,
  ExcludeFromTuple,
  Effect,
  EffectTypes,
} from './types';
import { Events } from './events';

export class Projection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
> {
  readonly name: ProjectionName;
  readonly events: Events<PayloadSchemas, EventTypes>;
  readonly handlers: Record<UnionOfTuple<EventTypes>, any>;

  constructor(
    name: ProjectionName,
    events: Events<PayloadSchemas, EventTypes>,
    handlers: Record<UnionOfTuple<EventTypes>, any> = {} as any
  ) {
    this.name = name;
    this.events = events;
    this.handlers = handlers;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: (
      event: Event<PayloadSchemas[EventType]>,
      api: MutationApi
    ) => Generator<Effect<EffectTypes>, void, unknown>
  ): Projection<ProjectionName, PayloadSchemas, ExcludeFromTuple<EventTypes, EventType>> {
    return new Projection<any, any, any>(this.name, this.events, {
      ...this.handlers,
      [eventType]: handler,
    });
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
