import * as t from 'io-ts';
import { NarrowableString, UnionOfTuple } from './types';

export class Events<
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, t.Type<any>>,
  EventTypes extends ReadonlyArray<NarrowableString>
> {
  readonly payloadSchemas: PayloadSchemas;
  readonly eventTypes: EventTypes;

  constructor(payloadSchemas: PayloadSchemas, eventTypes: EventTypes) {
    this.payloadSchemas = payloadSchemas;
    this.eventTypes = eventTypes;
  }

  define<EventType extends NarrowableString, PayloadSchema extends t.Type<any>>(
    eventType: EventType,
    payloadSchema: PayloadSchema,
  ): Events<
    PayloadSchemas & Record<EventType, PayloadSchema>,
    readonly [...EventTypes, EventType]
  > {
    return new Events<any, any>(
      { ...this.payloadSchemas, [eventType]: payloadSchema },
      [...this.eventTypes, eventType],
    );
  }
}

export const events = () => new Events({} as const, [] as const);
