import type { TKey, TStrictKey } from './types/event-sourcing';

export const prepareKey = (key: TKey): TStrictKey => {
  if (key == null || key.constructor !== String) {
    throw new TypeError();
  }
  return key.split('.');
};
