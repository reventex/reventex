import * as t from 'io-ts';
import { either } from 'fp-ts/Either'

import { EntityId } from './entity-id';

const typeEntityId = new t.Type<EntityId, { entityName: string;
  documentId: string }, unknown>(
  'DateFromString',
  (u): u is EntityId => u?.en,
  (u, c) =>
    either.chain(t.string.validate(u, c), (s) => {
      const d = new Date(s)
      return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d)
    }),
  (a) => a.toISOString()
)
