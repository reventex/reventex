import type { ImmutableContext, TStrictKey, TValue } from '../types/event-sourcing';
import { getIn } from './get-in';
import { setIn } from './set-in';
import { immutableClone } from './immutable-clone';
import { deepCompare } from './deep-compare';
import { deepFreeze } from './deep-freeze';

export function pullWithCompare(
  context: ImmutableContext,
  key: TStrictKey,
  value: TValue,
  compare: (a: any, b: any) => boolean,
  invert = false
) {
  let prevValue = getIn(context, key);

  if (prevValue === undefined) {
    prevValue = [];
  }

  if (!Array.isArray(prevValue)) {
    throw new Error(
      `Can't apply $pullAll to non-array field. ${JSON.stringify(context.state)} has the field ${JSON.stringify(
        key.join('.')
      )} of non-array type ${JSON.stringify(typeof prevValue)}`
    );
  }

  immutableClone(context, key, true);

  const newValues = prevValue.filter((item) => {
    if (Array.isArray(item)) {
      const valueLength = item.length;
      for (let j = 0; j < valueLength; j++) {
        if (deepCompare(item[j], value, compare)) {
          return invert;
        }
      }
    }
    if (deepCompare(item, value, compare)) {
      return invert;
    }

    return !invert;
  });

  setIn(context, key, newValues);

  deepFreeze(context.state);
}
