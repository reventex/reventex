import type { ImmutableContext, TStrictKey } from '../types/event-sourcing';
import { isNonNegativeInteger } from './is-non-negative-integer';

export function removeIn(context: ImmutableContext, key: TStrictKey) {
  const state = context.state;

  const lastKeyIndex = key.length - 1;
  if (lastKeyIndex === -1) {
    throw new Error('Key must not be empty');
  } else {
    let pointer = state;
    for (let index = 0; index < lastKeyIndex; index++) {
      const subKey: any = key[index];
      pointer = pointer[subKey];
    }
    const lastKey: any = key[lastKeyIndex];
    const isArray = Array.isArray(pointer);

    delete pointer[lastKey];

    if (isArray && isNonNegativeInteger(lastKey)) {
      const lastArrIndex = Math.max(lastKey, pointer.length);
      for (let arrIndex = 0; arrIndex < lastArrIndex; arrIndex++) {
        if (pointer[arrIndex] === undefined) {
          pointer[arrIndex] = null;
        }
      }
    }
  }
}
