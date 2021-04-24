import { TValue } from '../types';
import { deepCompare } from './deep-compare';

export function getUniqueValues(items: Array<TValue>): Array<TValue> {
  const uniqueValues = [];
  const length = items.length;
  for (let i = length - 1; i >= 0; i--) {
    let isDuplicate = false;
    const itemI = items[i];
    for (let j = 0; j < i; j++) {
      const itemJ = items[j];
      if (deepCompare(itemI, itemJ)) {
        isDuplicate = true;
      }
    }
    if (!isDuplicate) {
      uniqueValues.unshift(itemI);
    }
  }
  return uniqueValues;
}
