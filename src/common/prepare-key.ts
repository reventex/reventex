import { TKey, TStrictKey } from './types';

export const prepareKey = (key: TKey): TStrictKey => {
  if (key == null || key.constructor !== String) {
    throw new TypeError();
  }
  return key.split('.');
};
