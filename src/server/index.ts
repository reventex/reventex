import { MongoClient } from "mongodb";
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
  readonly connection: Promise<MongoClient>;
  readonly databaseName: DatabaseName;
  readonly eventStoreCollectionName: EventStoreCollectionName;
  readonly events: Events;
  readonly eventTypes: EventTypes;
  readonly projections: Projections;
  constructor(
    connection: Promise<MongoClient>,
    databaseName: DatabaseName = null,
    eventStoreCollectionName: EventStoreCollectionName = null,
    events: Events = [] as any,
    eventTypes: EventTypes = [] as any,
    projections: Projections = {} as any
  ) {
    this.connection = connection;
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
      this.connection,
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
      this.connection,
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
      this.connection,
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
      this.connection,
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
      this.connection,
      this.databaseName,
      name,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes]
    );
  }

  connect(
    connection: Promise<MongoClient>
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes]
  > {
    return new Domain<any, any, any, any, any>(
      connection,
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes]
    );
  }
}

const domain = {
  connect(connection: Promise<MongoClient>) {
    return new Domain(connection);
  },
};

const MONGO_USER = "MONGO_USER";
const MONGO_PASSWORD = "MONGO_PASSWORD";
const MONGO_DOMAIN = "MONGO_DOMAIN";
const MONGO_DATABASE = "MONGO_DATABASE";

const mongoConnectionUrl = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_DOMAIN}/${MONGO_DATABASE}?retryWrites=true&w=majority`;

const app = domain
  .connect(MongoClient.connect(mongoConnectionUrl))
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
