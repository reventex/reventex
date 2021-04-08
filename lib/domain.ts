import * as t from 'io-ts'
import {MongoClient} from 'mongodb'
import {ValuesOfTuple, Narrowable} from './types'

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
  EventTypes extends ReadonlyArray<Narrowable> = [],
  ProjectionNames extends ReadonlyArray<Narrowable> = []
  > {
  readonly connection: Promise<MongoClient>;
  readonly databaseName: DatabaseName;
  readonly eventStoreCollectionName: EventStoreCollectionName;
  readonly events: Events;
  readonly eventTypes: EventTypes;
  readonly projections: Projections;
  readonly projectionNames: ProjectionNames;
  constructor(
    connection: Promise<MongoClient>,
    databaseName: DatabaseName = null,
    eventStoreCollectionName: EventStoreCollectionName = null,
    events: Events = {} as any,
    projections: Projections = {} as any,
    eventTypes: EventTypes = [] as any,
    projectionNames: ProjectionNames = [] as any
  ) {
    this.connection = connection;
    this.databaseName = databaseName;
    this.eventStoreCollectionName = eventStoreCollectionName;
    this.events = events;
    this.projections = projections;
    this.eventTypes = eventTypes;
    this.projectionNames = projectionNames;
  }
  eventType<EventType extends string>(
    eventType: EventType
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes, EventType],
    readonly [...ProjectionNames]
    > {
    return new Domain<any, any, any, any, any, any>(
      this.connection,
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events },
      { ...this.projections },
      [...this.eventTypes, eventType],
      [...this.projectionNames]
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
    readonly [...EventTypes],
    readonly [...ProjectionNames, Name]
    > {
    return new Domain<any, any, any, any, any,any>(
      this.connection,
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events },
      {
        ...this.projections,
        [projection.name]: projection,
      },
      [...this.eventTypes],
      [...this.projectionNames, projection.name],
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
    readonly [...EventTypes, Type],
    readonly [...ProjectionNames]
    > {
    return new Domain<any, any, any, any, any, any>(
      this.connection,
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events, [type]: t.type(payloadSchema) },
      {
        ...this.projections,
      },
      [...this.eventTypes, type],
      [...this.projectionNames]
    );
  }

  database<DatabaseName extends string>(
    name: DatabaseName
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes],
    readonly [...ProjectionNames]
    > {
    return new Domain<any, any, any, any, any, any>(
      this.connection,
      name,
      this.eventStoreCollectionName,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes],
      [...this.projectionNames]
    );
  }

  eventStore<EventStoreCollectionName extends string>(
    name: EventStoreCollectionName
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes],
    readonly [...ProjectionNames]
    > {
    return new Domain<any, any, any, any, any, any>(
      this.connection,
      this.databaseName,
      name,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes],
      [...this.projectionNames]
    );
  }

  connect(
    connection: Promise<MongoClient>
  ): Domain<
    DatabaseName,
    EventStoreCollectionName,
    Events,
    Projections,
    readonly [...EventTypes],
    readonly [...ProjectionNames]
    > {
    return new Domain<any, any, any, any, any, any>(
      connection,
      this.databaseName,
      this.eventStoreCollectionName,
      { ...this.events },
      {
        ...this.projections,
      },
      [...this.eventTypes],
      [...this.projectionNames]
    );
  }
}

const domain = {
  connect(connection: Promise<MongoClient>) {
    return new Domain(connection);
  },
};

export default domain
