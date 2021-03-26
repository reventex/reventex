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
  DatabaseName extends string,
  EventStoreCollectionName extends string,
  Events extends Record<string, t.TypeC<any>>,
  Projections extends Record<
    string,
    {
      name: Narrowable;
      handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
    }
  > = {},
  EventTypes extends ReadonlyArray<Narrowable> = []
> {
  readonly databaseName: DatabaseName;
  readonly eventStoreCollectionName: EventStoreCollectionName;
  readonly events: Events;
  readonly eventTypes: EventTypes;
  readonly projections: Projections;
  constructor(
    databaseName: DatabaseName = null,
    eventStoreCollectionName: EventStoreCollectionName = null,
    events: Events = [] as any,
    eventTypes: EventTypes = [] as any,
    projections: Projections = {} as any
  ) {
    this.databaseName = databaseName;
    this.eventStoreCollectionName = eventStoreCollectionName;
    this.events = events;
    this.eventTypes = eventTypes;
    this.projections = projections;
  }
  eventType<EventType extends string>(
    eventType: EventType
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes, EventType]
  > {
    return new Domain<any, any, any, any, any>(
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events },
      { ...this.projections },
      [...this.eventTypes, eventType]
    );
  }
  projection<Name extends string>(projection: {
    name: Name;
    handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
  }): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections &
      Record<
        Name,
        {
          name: Name;
          handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
        }
      >,
    readonly [...EventTypes]
  > {
    return new Domain<any, any, any, any, any>(
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events },
      {
        ...this.projections,
        [projection.name]: projection,
      },
      [...this.eventTypes]
    );
  }

  event<Type extends string, PayloadSchema extends Record<string, any>>(
    type: Type,
    payloadSchema: PayloadSchema
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events & Record<Type, t.TypeC<PayloadSchema>>,
    Projections,
    readonly [...EventTypes, Type]
  > {
    return new Domain<any, any, any, any, any>(
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events, [type]: t.type(payloadSchema) },
      {
        ...this.projections,
      },
      [...this.eventTypes, type]
    );
  }

  database<DatabaseName extends string>(
    name: DatabaseName
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes]
  > {
    return new Domain<any, any, any, any, any>(
      name,
      this.eventStoreCollectionName,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes]
    );
  }

  eventStore<EventStoreCollectionName extends string>(
    name: EventStoreCollectionName
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes]
  > {
    return new Domain<any, any, any, any, any>(
      this.databaseName,
      name,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes]
    );
  }
}

const domain = () => new Domain();

const app = domain()
  .database("dbname")
  .eventStore("events")
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

const dbname = app.databaseName;
const events = app.eventStoreCollectionName;

type createT = t.TypeOf<typeof app.events.create>;
type dropT = t.TypeOf<typeof app.events.drop>;
type eventsT = typeof app.eventTypes;
