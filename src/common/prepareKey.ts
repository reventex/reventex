import { TKey, TStrictKey } from './types';

export const prepareKey = (key: TKey): TStrictKey => {
  if (Array.isArray(key)) {
    const keyLength = key.length;
    for (let index = 0; index < keyLength; index++) {
      if (String(key[index]).indexOf('.') !== -1) {
        throw new TypeError();
      }
    }
    return key;
  } else {
    if (String(key).indexOf('.') !== -1) {
      throw new TypeError();
    }
    return [key];
  }
};
