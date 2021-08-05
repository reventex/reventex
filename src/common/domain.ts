import type { MongoClient, ClientSessionOptions, ClientSession, Collection } from 'mongodb';
import { ObjectId } from 'mongodb';

import type { UnionOfTuple } from './types/helpers';
import type { EventFromDatabase, EventFromClient, RecordFromResolvers } from './types/event-sourcing';
import type { TClass, ExtractCompileTimeTypes, ExtractCompileTimeType } from './io';
import type { Events } from './events';
import type { Projection } from './projection';
import type { Resolver } from './resolver';
import type { EntityId } from './entity-id';
import { PRIVATE } from './constants';
import { EntityIdWithDocumentVersion } from './entity-id';
import { extractEntityIdsFromEvent } from './extract-entity-ids-from-event';
import { processor } from './mongo/processor';
import { mutationApi } from './mutation-api';
import { recordOfResolvers } from './resolver';

const sessionOptions: ClientSessionOptions = {
  causalConsistency: true,
  // defaultTransactionOptions: {
  //   //readConcern: ReadConcern('snapshot'),
  //  // writeConcern: WriteConcern.fromOptions({ w: 'majority', wtimeout: 30000, j: true }),
  // },
};

function checkRequiredFields<A extends Array<any>, B extends any>(
  domain: Domain<any, any, any, any, any>,
  method: (...args: A) => B
) {
  return function wrappedMethod(...args: A): B {
    if (domain[PRIVATE].eventStoreCollectionName == null) {
      throw new Error('Event store is required');
    }
    if (domain[PRIVATE].eventStoreMetaCollectionName == null) {
      throw new Error('Event store meta is required');
    }
    // if (domain[PRIVATE].databaseName == null) {
    //   throw new Error('Database name is required');
    // }
    return method.apply(domain, args);
  };
}

function ignoreAlreadyExists(error: Error & { code?: number }) {
  if (error?.code !== 48) {
    throw error;
  }
}

function ignoreNotExists(error: Error & { code?: number }) {
  if (error?.code !== 26) {
    throw error;
  }
}

export class Domain<
  EventStoreCollectionName extends string,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>,
  EventTypes extends ReadonlyArray<string>,
  Projections extends
    | ReadonlyArray<Projection<EventStoreCollectionName, any, any, any>>
    | [Projection<EventStoreCollectionName, any, any, any>],
  Resolvers extends RecordFromResolvers<
    | ReadonlyArray<Resolver<string, ReadonlyArray<TClass<any>>, TClass<any>>>
    | [Resolver<string, ReadonlyArray<TClass<any>>, TClass<any>>]
  >
> {
  [PRIVATE]: {
    events: Events<EventStoreCollectionName, PayloadSchemas, EventTypes>;
    projections: Projections;
    resolvers: Resolvers;
    databaseName: string;
    eventStoreCollectionName: string;
    eventStoreMetaCollectionName: string;
    resolverClient: Promise<MongoClient>;
    builderClient: Promise<MongoClient>;
    resolverSession: Promise<ClientSession>;
    builderSession: Promise<ClientSession>;
  };

  constructor(events: Events<EventStoreCollectionName, PayloadSchemas, EventTypes>) {
    Object.defineProperty(this, PRIVATE, {
      value: {
        events,
        projections: [],
        sideEffects: [],
        resolvers: {},
        documentId: ObjectId,
        eventStoreCollectionName: events.collectionName,
        eventStoreMetaCollectionName: `${events.collectionName}-meta`,
      },
    });
    this.publish = checkRequiredFields(this, this.publish);
    this.build = checkRequiredFields(this, this.build);
    this.drop = checkRequiredFields(this, this.drop);
    this.read = checkRequiredFields(this, this.read);
    this.close = checkRequiredFields(this, this.close);
  }
  connect(builderClient: Promise<any>, resolverClient?: Promise<any>) {
    if (builderClient == null) {
      throw new Error('Argument "client" is required');
    }
    this[PRIVATE].builderClient = Promise.resolve(builderClient);
    this[PRIVATE].resolverClient =
      resolverClient == null ? this[PRIVATE].builderClient : Promise.resolve(resolverClient);

    this[PRIVATE].builderSession = this[PRIVATE].builderClient.then((client: MongoClient) =>
      client.startSession(sessionOptions)
    );
    if (this[PRIVATE].builderClient !== this[PRIVATE].resolverClient) {
      this[PRIVATE].resolverSession = this[PRIVATE].resolverClient.then((client: MongoClient) =>
        client.startSession(sessionOptions)
      );
    }

    return this;
  }
  projections<NewProjections extends Array<Projection<EventStoreCollectionName, any, any, any>>>(
    projections: NewProjections
  ): Domain<EventStoreCollectionName, PayloadSchemas, EventTypes, [...Projections, ...NewProjections], Resolvers> {
    const items: [...Projections, ...NewProjections] = [...this[PRIVATE].projections, ...projections];
    Object.assign(this[PRIVATE], { projections: items });
    return this as any;
  }
  resolvers<TupleWithResolvers extends ReadonlyArray<Resolver<any, any, any>> | [Resolver<any, any, any>]>(
    resolvers: TupleWithResolvers
  ): Domain<
    EventStoreCollectionName,
    PayloadSchemas,
    EventTypes,
    Projections,
    Resolvers & RecordFromResolvers<TupleWithResolvers>
  > {
    Object.assign(this[PRIVATE].resolvers, recordOfResolvers(resolvers));
    return this as any;
  }
  async init() {
    const {
      builderClient,
      builderSession,
      databaseName,
      eventStoreCollectionName,
      eventStoreMetaCollectionName,
      projections,
    } = this[PRIVATE];

    const database = await (await builderClient).db(databaseName);
    const session = await builderSession;

    const collectionPromises: Array<Promise<any>> = [];

    collectionPromises.push(
      database.createCollection(eventStoreCollectionName, { session }).catch(ignoreAlreadyExists),
      database.createCollection(eventStoreMetaCollectionName, { session }).catch(ignoreAlreadyExists)
    );

    for (const { name } of projections) {
      collectionPromises.push(database.createCollection(name, { session }).catch(ignoreAlreadyExists));
    }

    await Promise.all(collectionPromises);

    const eventStore = database.collection(eventStoreCollectionName);
    const eventStoreMeta = database.collection(eventStoreMetaCollectionName);

    const indexPromises: Array<Promise<any>> = [];

    indexPromises.push(
      eventStore.createIndex(
        {
          'entityId.documentId': 1,
          'entityId.entityName': 1,
        },
        { session }
      ),
      eventStore.createIndex(
        {
          'entityId.documentVersion': 1,
        },
        { session }
      ),
      eventStoreMeta.createIndex(
        {
          entityName: 1,
          documentId: 1,
        },
        { session }
      )
    );

    for (const { name, indexes } of projections) {
      const collection = database.collection(name);
      for (const indexSpec of indexes) {
        indexPromises.push(collection.createIndex(indexSpec, { session }));
      }
    }

    await Promise.all(indexPromises);
  }

  async build() {
    const { builderClient, builderSession, databaseName, eventStoreCollectionName, projections } = this[PRIVATE];

    const database = await (await builderClient).db(databaseName);
    const session = await builderSession;

    const eventStore = database.collection(eventStoreCollectionName);

    const countProjections = projections.length;

    const cursor = eventStore.find({}, { session, projection: { _id: 0 } }).sort({ 'entityId.documentVersion': 1 });

    while (await cursor.hasNext()) {
      const item = await cursor.next();

      if (item == null) {
        break;
      }

      const { entityId: entityIds, ...rawEvent } = item;

      // TODO
      const event: EventFromDatabase = rawEvent as any;

      const countEntityIds = entityIds.length;

      for (let entityIdIndex = 0; entityIdIndex < countEntityIds; entityIdIndex++) {
        const { entityName, documentId } = entityIds[entityIdIndex];

        const collection = database.collection(entityName);

        const documentIdAsObjectId = new ObjectId(documentId);

        for (let projectionIndex = 0; projectionIndex < countProjections; projectionIndex++) {
          const projection = projections[projectionIndex];

          if (projection == null) {
            continue;
          }

          const eventHandler = projection.handlers[event.type];

          if (entityName === projection.name && eventHandler != null) {
            const iterator = eventHandler({
              event,
              documentId,
              api: mutationApi,
            });

            let result: any = undefined;
            for (;;) {
              const { value: effect, done } = iterator.next(result);
              if (done || effect == null) {
                break;
              }
              result = await processor(
                {
                  documentId: documentIdAsObjectId,
                  collection,
                  session,
                },
                effect
              );
            }
          }
        }
      }
    }
  }
  async drop(options?: { eventStore?: boolean }) {
    const {
      builderClient,
      builderSession,
      databaseName,
      eventStoreCollectionName,
      eventStoreMetaCollectionName,
      projections,
    } = this[PRIVATE];

    const database = await (await builderClient).db(databaseName);
    const session = await builderSession;

    const collections: Array<Collection> = [];

    const databasePromises: Array<Promise<any>> = [];

    if (options != null && options.eventStore) {
      const eventStore = database.collection(eventStoreCollectionName);
      const eventStoreMeta = database.collection(eventStoreMetaCollectionName);
      collections.push(eventStore);
      collections.push(eventStoreMeta);
    }

    for (const { name } of projections) {
      collections.push(database.collection(name));
    }

    for (const collection of collections) {
      databasePromises.push(collection.drop({ session }).catch(ignoreNotExists));
    }

    await Promise.all(databasePromises);
  }
  async publish(...events: Array<EventFromClient<EventTypes, PayloadSchemas>>) {
    const { projections, builderClient, builderSession, eventStoreCollectionName, eventStoreMetaCollectionName } =
      this[PRIVATE];

    const countEvents = events.length;
    const databasePromises: Array<Promise<any>> = [];

    const session = await builderSession;

    await session.startTransaction();
    const database = await (await builderClient).db();

    const eventStore = database.collection(eventStoreCollectionName);
    const eventStoreMeta = database.collection(eventStoreMetaCollectionName);

    const entityIdsByEvent = new WeakMap<any, Array<EntityId>>();

    try {
      for (let eventIndex = 0; eventIndex < countEvents; eventIndex++) {
        const rawEvent = events[eventIndex];
        if (rawEvent == null) {
          throw new TypeError();
        }
        const event: EventFromDatabase = {
          ...rawEvent,
          timestamp: -1,
        };
        const entityIds = extractEntityIdsFromEvent(event);
        if (entityIds.length === 0) {
          throw new Error(`Incorrect event: ${JSON.stringify(event)}`);
        }

        entityIdsByEvent.set(event, entityIds);

        const countEntityIds = entityIds.length;

        const entityNameIndexes = new Map<string, number>();

        for (let entityIdIndex = 0; entityIdIndex < countEntityIds; entityIdIndex++) {
          const entityId = EntityIdWithDocumentVersion.fromEntityId(entityIds[entityIdIndex], -1);
          if (entityId == null) {
            throw new TypeError();
          }
          const { entityName, documentId } = entityId;

          const documentIdAsObjectId = new ObjectId(documentId);

          entityNameIndexes.set(entityName, entityIdIndex);

          const { documentVersion: originalDocumentVersion } =
            (await eventStoreMeta.findOne(
              {
                entityName,
                documentId: documentIdAsObjectId,
              },
              {
                projection: { documentVersion: 1 },
                session,
              }
            )) || {};
          let documentVersion = originalDocumentVersion;

          documentVersion = ~~documentVersion + 1;
          entityId.documentVersion = documentVersion;

          await eventStoreMeta.updateOne(
            {
              entityName,
              documentId: documentIdAsObjectId,
            },
            { $set: { documentVersion } },
            {
              session,
              upsert: true,
            }
          );
        }

        const eventId = new ObjectId();
        const eventWithoutTimestamp: any = { ...event };
        delete eventWithoutTimestamp.timestamp;
        const { upsertedCount, modifiedCount } = await eventStore.updateOne(
          { _id: eventId },
          {
            $currentDate: {
              timestamp: true,
            },
            $setOnInsert: {
              ...eventWithoutTimestamp,
              entityId: entityIds,
            },
          },
          {
            session,
            upsert: true,
          }
        );
        if (upsertedCount !== 1 || modifiedCount !== 0) {
          const concurrencyError: Error & { code?: number } = new Error('Concurrency error');
          concurrencyError.code = 412;
          throw concurrencyError;
        }

        const foundEvent = await eventStore.findOne(
          { _id: eventId },
          {
            session,
            projection: {
              _id: 0,
              timestamp: 1,
            },
          }
        );

        event.timestamp = foundEvent?.timestamp ?? -1;

        if (event.timestamp === -1) {
          throw new TypeError();
        }

        for (let entityIdIndex = 0; entityIdIndex < countEntityIds; entityIdIndex++) {
          const entityId = entityIds[entityIdIndex];
          if (entityId == null) {
            throw new TypeError();
          }
          const { entityName, documentId } = entityId;

          const documentIdAsObjectId = new ObjectId(documentId);

          const collection = database.collection(entityName);

          const projection = projections.find(({ name }) => name === entityName);
          if (projection != null) {
            const eventHandler = projection.handlers[event.type];

            if (entityName === projection.name && eventHandler != null) {
              const iterator = eventHandler({
                event,
                documentId,
                api: mutationApi,
              });

              let result: any = undefined;
              for (;;) {
                const { value: effect, done } = iterator.next(result);
                if (done || effect == null) {
                  break;
                }
                result = await processor(
                  {
                    documentId: documentIdAsObjectId,
                    collection,
                    session,
                  },
                  effect
                );
              }
            }
          }
        }
      }

      await Promise.all(databasePromises);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }
  async close() {
    const { builderClient, resolverClient, builderSession, resolverSession } = this[PRIVATE];
    await (await builderSession).endSession();
    await (await builderClient).close();
    if (builderClient !== resolverClient) {
      await (await resolverSession).endSession();
      await (await resolverClient).close();
    }
  }
  async read<ResolverName extends keyof Resolvers>(
    resolverName: ResolverName,
    ...resolverArgs: ExtractCompileTimeTypes<Resolvers[ResolverName]['inputSchema']>
  ): Promise<ExtractCompileTimeType<Resolvers[ResolverName]['outputSchema']>> {
    const { resolvers, builderClient, builderSession, databaseName } = this[PRIVATE];

    const resolver = resolvers[resolverName];

    if (resolver == null) {
      throw new Error(`The resolver "${resolverName}" is not found`);
    }
    const session = await builderSession;
    const database = await (await builderClient).db(databaseName);
    const objectId = (id: string) => new ObjectId(id);

    return await resolver.implementation({ database, session, objectId }, ...[...resolverArgs]);
  }
}

const emptyArray = [] as const;
type EmptyArray = typeof emptyArray;
const emptyObject = {} as const;
type EmptyObject = typeof emptyObject;

export const domain = <
  EventStoreCollectionName extends string,
  PayloadSchemas extends Record<UnionOfTuple<EventTypes>, TClass<any>>,
  EventTypes extends ReadonlyArray<string>
>(
  events: Events<EventStoreCollectionName, PayloadSchemas, EventTypes>
) => ({
  connect(builderClient: Promise<MongoClient>, resolverClient?: Promise<MongoClient>) {
    const instance = new Domain<EventStoreCollectionName, PayloadSchemas, EventTypes, EmptyArray, EmptyObject>(events);
    return instance.connect(builderClient, resolverClient);
  },
  projections(projections: Array<Projection<any, any, any, any>>) {
    const instance = new Domain<EventStoreCollectionName, PayloadSchemas, EventTypes, EmptyArray, EmptyObject>(events);
    return instance.projections(projections);
  },
  resolvers<
    TupleWithResolvers extends
      | ReadonlyArray<Resolver<string, ReadonlyArray<TClass<any>>, TClass<any>>>
      | [Resolver<string, ReadonlyArray<TClass<any>>, TClass<any>>]
  >(resolvers: TupleWithResolvers) {
    const instance = new Domain<EventStoreCollectionName, PayloadSchemas, EventTypes, EmptyArray, EmptyObject>(events);
    return instance.resolvers(resolvers);
  },
});
