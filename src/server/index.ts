import * as t from "io-ts";

import validate from "./validate";

type Narrowable =
  | string
  | number
  | boolean
  | symbol
  | object
  | undefined
  | void
  | null
  | {};

export type ValuesOfTuple<
  T extends ReadonlyArray<any>
> = T extends ReadonlyArray<any> ? T[number] : never;

class Domain<
  Events extends Record<string, t.TypeC<any>>,
  EventTypes extends ReadonlyArray<Narrowable> = [],
  Projections extends Record<
    string,
    {
      name: Narrowable;
      handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
    }
  > = {}
> {
  readonly events: Events = {} as any;
  readonly eventTypes: EventTypes = [] as any;
  readonly projections: Projections = {} as any;
  constructor(
    events: Events = [] as any,
    eventTypes: EventTypes = [] as any,
    projections: Projections = {} as any
  ) {
    this.events = events;
    this.eventTypes = eventTypes;
    this.projections = projections;
  }
  eventType<EventType extends string>(
    eventType: EventType
  ): Domain<Events, readonly [...EventTypes, EventType], Projections> {
    return new Domain<any, any, any>(
      { ...this.events },
      [...this.eventTypes, eventType],
      {
        ...this.projections,
      }
    );
  }
  projection<Name extends string>(projection: {
    name: Name;
    handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
  }): Domain<
    Events,
    readonly [...EventTypes],
    Projections &
      Record<
        Name,
        {
          name: Name;
          handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
        }
      >
  > {
    return new Domain<any, any, any>({ ...this.events }, [...this.eventTypes], {
      ...this.projections,
      [projection.name]: projection,
    });
  }

  event<Type extends string, PayloadSchema extends Record<string, any>>(
    type: Type,
    payloadSchema: PayloadSchema
  ): Domain<
    Events & Record<Type, t.TypeC<PayloadSchema>>,
    readonly [...EventTypes, Type],
    Projections
  > {
    return new Domain<any, any, any>(
      { ...this.events, [type]: t.type(payloadSchema) },
      [...this.eventTypes, type],
      {
        ...this.projections,
      }
    );
  }
}

const domain = () => new Domain();

const app = domain()
  .event("create", { a: t.boolean })
  .event("drop", { b: t.number })
  .event("dispose", { c: t.string })
  .projection({
    name: "A",
    handlers: {
      create: true,
      drop: true,
    },
  })
  .projection({
    name: "B",
    handlers: {
      dispose: true,
    },
  });

type createT = t.TypeOf<typeof app.events.create>;
type dropT = t.TypeOf<typeof app.events.drop>;
type eventsT = typeof app.eventTypes;
