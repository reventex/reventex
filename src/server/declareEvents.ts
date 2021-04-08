import * as t from "io-ts";
import { Narrowable, UnionOfTuple } from "./types";

export type Event<PayloadSchema extends Record<string, unknown>> = {
  timestamp: number
  payload: PayloadSchema
}

// export const VirtualHostsSchema =
//   t.type({
//     VirtualHost: t.string,
//     FunctionArn: t.boolean,
//   })
//
// export type VirtualHosts = Event<t.TypeOf<typeof VirtualHostsSchema>>

export class Events<
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<Narrowable>
> {
  readonly payloadSchemas: PayloadSchemas;
  readonly eventTypes: EventTypes;

  constructor(
    payloadSchemas: PayloadSchemas,
    eventTypes: EventTypes
  ) {
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
    return new Events<any, any>({ ...this.payloadSchemas, [type]: t.type(payloadSchema) }, [
      ...this.eventTypes,
      type,
    ]);
  }
}

const declareEvents = () => new Events({} as const, [] as const);

export default declareEvents;
