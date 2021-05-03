import {
  ObjectId,
  MongoClient,
  ClientSessionOptions,
  ClientSession,
  Collection,
  ReadConcern,
  WriteConcern,
} from 'mongodb';

import { PRIVATE } from './constants';
import { EventFromDatabase, EventFromClient } from './types';
import { extractEntityIdsFromEvent } from './extract-entity-ids-from-event';
import { Projection } from './projection';
import { Resolver } from './resolver';
import { EntityId, EntityIdWithDocumentVersion } from './entity-id';
import { processor } from './mongo/processor';
import { mutationApi } from './mutation-api';

const sessionOptions: ClientSessionOptions = {
  causalConsistency: true,
  defaultTransactionOptions: {
    readConcern: ReadConcern.fromOptions({ level: 'snapshot' }),
    writeConcern: WriteConcern.fromOptions({ w: 'majority', wtimeout: 30000, j: true }),
  },
};

function checkRequiredFields<A extends Array<any>, B extends any>(
  domain: Domain<Array<Projection<any, any, any>>, Map<string, Resolver<string, Array<any>, any>>>,
  method: (...args: A) => B
) {
  return function wrappedMethod(...args: A): B {
    if (domain[PRIVATE].eventStoreCollectionName == null) {
      throw new Error('Event store is required');
    }
    if (domain[PRIVATE].eventStoreMetaCollectionName == null) {
      throw new Error('Event store meta is required');
    }
    if (domain[PRIVATE].databaseName == null) {
      throw new Error('Database name is required');
    }
    return method.apply(domain, args);
  };
}

export class Domain<
  Projections extends Array<Projection<any, any, any>>,
  Resolvers extends Map<string, Resolver<string, Array<any>, any>>
> {
  [PRIVATE]: {
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

  constructor() {
    Object.defineProperty(this, PRIVATE, {
      value: {
        projections: [],
        sideEffects: [],
        resolvers: new Map(),
        documentId: ObjectId,
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
  projections(projections: Array<Projection<any, any, any>>) {
    this[PRIVATE].projections.push(...projections);
    return this;
  }
  resolvers(resolvers: Array<Resolver<any, any, any>>) {
    for (const resolver of resolvers) {
      const { name } = resolver;
      this[PRIVATE].resolvers.set(name, resolver);
    }
    return this;
  }
  eventStore(eventStoreCollectionName: string) {
    this[PRIVATE].eventStoreCollectionName = eventStoreCollectionName;
    this[PRIVATE].eventStoreMetaCollectionName = `${eventStoreCollectionName}-meta`;
    return this;
  }
  database(databaseName: string) {
    this[PRIVATE].databaseName = databaseName;
    return this;
  }
  async build() {
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
      database.createCollection(eventStoreCollectionName, { session }),
      database.createCollection(eventStoreMetaCollectionName, { session })
    );

    for (const { name } of projections) {
      collectionPromises.push(database.createCollection(name, { session }));
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

    const countProjections = projections.length;

    const cursor = eventStore
      .find({}, { session, projection: { _id: 0 } })
      .sort({ 'entityId.documentVersion': 1 });

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

            for (const effect of iterator) {
              await processor(
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
      databasePromises.push(
        collection.drop({ session }).catch(function (error: Error & { code?: number }) {
          if (error.code != 26) {
            throw error;
          }
        })
      );
    }

    await Promise.all(databasePromises);
  }
  async publish(events: Array<EventFromClient>) {
    const {
      projections,
      builderClient,
      builderSession,
      databaseName,
      eventStoreCollectionName,
      eventStoreMetaCollectionName,
    } = this[PRIVATE];

    const countEvents = events.length;
    const databasePromises: Array<Promise<any>> = [];

    const session = await builderSession;

    await session.startTransaction();
    const database = await (await builderClient).db(databaseName);

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
        if (event == null || entityIds.length === 0) {
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
        const { upsertedCount, modifiedCount } = await eventStore.updateOne(
          { _id: eventId },
          {
            $currentDate: {
              timestamp: true,
            },
            $setOnInsert: {
              ...event,
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

        event.timestamp = (
          await eventStore.findOne(
            { _id: eventId },
            {
              session,
              projection: {
                _id: 0,
                timestamp: 1,
              },
            }
          )
        ).timestamp;

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

              for (const effect of iterator) {
                await processor(
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
    const { builderClient, resolverClient } = this[PRIVATE];
    await (await builderClient).close();
    if (builderClient !== resolverClient) {
      await (await resolverClient).close();
    }
  }
  async read(resolverName: string, ...resolverArgs: Array<any>) {
    const { resolvers, builderClient, builderSession, databaseName } = this[PRIVATE];

    const resolver = resolvers.get(resolverName);
    if (resolver == null) {
      throw new Error(`The resolver "${resolverName}" is not found`);
    }
    const session = await builderSession;
    const database = await (await builderClient).db(databaseName);

    return resolver.implementation({ database, session }, ...resolverArgs);
  }
}

export const domain = {
  connect(builderClient: Promise<MongoClient>, resolverClient?: Promise<MongoClient>) {
    const instance = new Domain();
    return instance.connect(builderClient, resolverClient);
  },
  projections(projections: Array<Projection<any, any, any>>) {
    const instance = new Domain();
    return instance.projections(projections);
  },
  eventStore(eventStoreCollectionName: string) {
    const instance = new Domain();
    return instance.eventStore(eventStoreCollectionName);
  },
  resolvers(resolvers: Array<Resolver<any, any, any>>) {
    const instance = new Domain();
    return instance.resolvers(resolvers);
  },
};
