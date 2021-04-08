import * as t from "io-ts";
import { Narrowable, UnionOfTuple, ExcludeFromTuple } from "./types";
import { Events, Event } from "./declareEvents";

export class Projection<
  ProjectionName extends Narrowable,
  PayloadSchemas extends Record<string, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<Narrowable>
> {
  readonly name: ProjectionName;
  readonly events: Events<PayloadSchemas, EventTypes>;

  constructor(name: ProjectionName, events: Events<PayloadSchemas, EventTypes>) {
    this.name = name;
    this.events = events;
  }

  on<EventType extends UnionOfTuple<EventTypes>>(
    eventType: EventType,
    handler: (event: PayloadSchemas[EventType] )
  ): Projection<ProjectionName, PayloadSchemas, ExcludeFromTuple<EventTypes, EventType>> {
    return this as any
  }
}

function declareProjection<
  ProjectionName extends Narrowable,
  Schemas extends Record<string, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<Narrowable>
>(
  name: ProjectionName,
  events: Events<Schemas, EventTypes>
): Projection<ProjectionName, Schemas, EventTypes> {
  return new Projection(name, events);
}

export default declareProjection;
