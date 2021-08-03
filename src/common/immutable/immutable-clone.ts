import type { ImmutableContext, TStrictKey } from '../types/event-sourcing';
import { isNonNegativeInteger } from './is-non-negative-integer';

export function immutableClone(context: ImmutableContext, key: TStrictKey, skipLastSubKey = false) {
  const state = context.state;

  const clonedState = { ...state };

  let pointer = clonedState;
  const keyLength = skipLastSubKey ? key.length - 1 : key.length;

  let inArray = false;
  for (let index = 0; index < keyLength; index++) {
    const subKey: any = key[index];

    if (Object(pointer) !== pointer || (Array.isArray(pointer) && !isNonNegativeInteger(subKey))) {
      throw new Error(`Cannot create field ${JSON.stringify(subKey)} in element ${JSON.stringify(pointer)}`);
    }

    if (Array.isArray(pointer[subKey])) {
      pointer[subKey] = [...pointer[subKey]];
      inArray = true;
    } else {
      if (inArray && isNonNegativeInteger(subKey)) {
        for (let arrIndex = 0; arrIndex < subKey; arrIndex++) {
          if (pointer[arrIndex] === undefined) {
            pointer[arrIndex] = null;
          }
        }
      }
      pointer[subKey] = { ...pointer[subKey] };
      inArray = false;
    }
    pointer = pointer[subKey];
  }

  context.state = clonedState;
}
