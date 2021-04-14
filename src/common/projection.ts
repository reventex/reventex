import * as t from 'io-ts';

import {
  Event,
  MutationApi,
  NarrowableString,
  UnionOfTuple,
  ExcludeFromTuple,
} from './types';
import { Events } from './events';

export class Projection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
> {
  readonly name: ProjectionName;
  readonly events: Events<PayloadSchemas, EventTypes>;

  constructor(
    name: ProjectionName,
    events: Events<PayloadSchemas, EventTypes>,
  ) {
    this.name = name;
    this.events = events;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: (
      event: Event<PayloadSchemas[EventType]>,
      api: MutationApi,
    ) => Generator<string, void, unknown>,
  ): Projection<
    ProjectionName,
    PayloadSchemas,
    ExcludeFromTuple<EventTypes, EventType>
  > {
    return this as any;
  }
}

export function projection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
>(
  name: ProjectionName,
  events: Events<PayloadSchemas, EventTypes>,
): Projection<ProjectionName, PayloadSchemas, EventTypes> {
  return new Projection<ProjectionName, PayloadSchemas, EventTypes>(
    name,
    events,
  );
}
