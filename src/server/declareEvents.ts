import * as t from "io-ts";
import { NarrowableString, UnionOfTuple } from "./types";

export class Events<
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
> {
  readonly payloadSchemas: PayloadSchemas;
  readonly eventTypes: EventTypes;

  constructor(payloadSchemas: PayloadSchemas, eventTypes: EventTypes) {
    this.payloadSchemas = payloadSchemas;
    this.eventTypes = eventTypes;
  }

  event<EventType extends string, PayloadSchema extends Record<string, any>>(
    type: EventType,
    payloadSchema: PayloadSchema
  ): Events<
    PayloadSchemas & Record<EventType, t.TypeC<PayloadSchema>>,
    readonly [...EventTypes, EventType]
  > {
    return new Events<any, any>(
      { ...this.payloadSchemas, [type]: t.type(payloadSchema) },
      [...this.eventTypes, type]
    );
  }
}

const declareEvents = () => new Events({} as const, [] as const);

export default declareEvents;
