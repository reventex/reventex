import * as t from "io-ts";
import {
  Event,
  MutationApi,
  NarrowableString,
  UnionOfTuple,
  ExcludeFromTuple,
} from "./types";
import { Events } from "./declareEvents";

export class Projection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<NarrowableString, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
> {
  readonly name: ProjectionName;
  readonly events: Events<PayloadSchemas, EventTypes>;

  constructor(
    name: ProjectionName,
    events: Events<PayloadSchemas, EventTypes>
  ) {
    this.name = name;
    this.events = events;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: (
      event: Event<t.TypeOf<PayloadSchemas[EventType]>>,
      api: MutationApi
    ) => Generator<string, void, unknown>
  ): Projection<
    ProjectionName,
    PayloadSchemas,
    ExcludeFromTuple<EventTypes, EventType>
  > {
    return this as any;
  }
}

function declareProjection<
  ProjectionName extends NarrowableString,
  PayloadSchemas extends Record<NarrowableString, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
>(
  name: ProjectionName,
  events: Events<PayloadSchemas, EventTypes>
): Projection<ProjectionName, PayloadSchemas, EventTypes> {
  return new Projection(name, events);
}

export default declareProjection;
