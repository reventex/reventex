import { TValue, MongoContext, Effect, EffectTypes } from '../types';

export async function processor(context: MongoContext, effect: Effect<EffectTypes>) {
  const { session, collection, documentId } = context;
  const { type, key, value, sliceSize } = effect;
  // TODO
  void sliceSize

  switch (type) {
    case 'set': {
      if (key.length === 0) {
        await collection.replaceOne(
          { _id: documentId },
          {
            ...value,
          },
          {
            session,
            upsert: true,
          }
        );
      } else {
        await collection.updateOne(
          { _id: documentId },
          {
            $set: {
              [key.join('.')]: value,
            },
          },
          { session, upsert: true }
        );
      }

      break;
    }
    case 'remove': {
      if (key.length === 0) {
        await collection.deleteOne({ _id: documentId }, { session });
      } else {
        await collection.updateOne(
          { _id: documentId },
          {
            $unset: {
              [key.join('.')]: '',
            },
          },
          { session, upsert: true }
        );
      }
      break;
    }
    case 'merge': {
      const $set: { [key: string]: TValue } = {};
      for (let kv in value) {
        if (!value.hasOwnProperty(kv)) {
          continue;
        }
        $set[[...key, kv].join('.')] = value[kv];
      }

      await collection.updateOne(
        { _id: documentId },
        {
          $set,
        },
        { session, upsert: true }
      );
      break;
    }
    case 'setMaximum': {
      await collection.updateOne(
        { _id: documentId },
        {
          $max: {
            [key.join('.')]: value,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'setMinimum': {
      await collection.updateOne(
        { _id: documentId },
        {
          $min: {
            [key.join('.')]: value,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'increment': {
      await collection.updateOne(
        { _id: documentId },
        {
          $inc: {
            [key.join('.')]: value,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'decrement': {
      await collection.updateOne(
        { _id: documentId },
        {
          $inc: {
            [key.join('.')]: -value,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'multiply': {
      await collection.updateOne(
        { _id: documentId },
        {
          $mul: {
            [key.join('.')]: value,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'divide': {
      await collection.updateOne(
        { _id: documentId },
        {
          $mul: {
            [key.join('.')]: 1 / value,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'rename': {
      const newKey = value;
      await collection.updateOne(
        { _id: documentId },
        {
          $rename: {
            [key.join('.')]: [].concat(newKey).join('.'),
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'addToSet': {
      const items = [].concat(value);

      await collection.updateOne(
        { _id: documentId },
        {
          $addToSet: {
            [key.join('.')]: {
              $each: items,
            },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pushFront': {
      const items = [].concat(value);

      await collection.updateOne(
        { _id: documentId },
        {
          $push: {
            [key.join('.')]: {
              $each: items,
              $position: 0,
            },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'popFront': {
      await collection.updateOne(
        { _id: documentId },
        {
          $pop: {
            [key.join('.')]: -1,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pushBack': {
      const items = [].concat(value);

      await collection.updateOne(
        { _id: documentId },
        {
          $push: {
            [key.join('.')]: {
              $each: items,
            },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'popBack': {
      await collection.updateOne(
        { _id: documentId },
        {
          $pop: {
            [key.join('.')]: 1,
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullIN': {
      const items = [].concat(value);

      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: {
              $in: items,
            },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullNIN': {
      const items = [].concat(value);

      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $nin: items },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullEQ': {
      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $in: [value] },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullGT': {
      if (Object(value) === value) {
        throw new TypeError();
      }
      if (Array.isArray(value)) {
        throw new TypeError();
      }

      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $gt: value },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullGTE': {
      if (Object(value) === value) {
        throw new TypeError();
      }

      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $gte: value },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullLT': {
      if (Object(value) === value) {
        throw new TypeError();
      }
      if (Array.isArray(value)) {
        throw new TypeError();
      }

      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $lt: value },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullLTE': {
      if (Object(value) === value) {
        throw new TypeError();
      }
      if (Array.isArray(value)) {
        throw new TypeError();
      }

      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $lte: value },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'pullNE': {
      await collection.updateOne(
        { _id: documentId },
        {
          $pull: {
            [key.join('.')]: { $ne: value },
          },
        },
        { session, upsert: true }
      );
      break;
    }
    case 'get': {
      const keyLength = key.length;

      const projection =
        keyLength === 0
          ? { _id: 0, _version: 0 }
          : {
              [key.join('.')]: 1,
              _id: 0,
            };

      const result = await collection.findOne({ _id: documentId }, { projection, session });

      if (keyLength === 0) {
        return result;
      }

      let pointer = result;

      for (let index = 0; index < keyLength; index++) {
        if (pointer == null) {
          return undefined;
        }
        const pointerKey: any = key[index]
        pointer = pointer[pointerKey];
      }

      return pointer;
    }
  }
}
