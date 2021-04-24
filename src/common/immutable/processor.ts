import { EffectTypes, ImmutableContext } from '../types';
import { Effect } from '../types';
import { checkPrimitive } from './check-primitive';
import { compareEQ, compareGT, compareGTE, compareLT, compareLTE } from './compare';
import { deepCompare } from './deep-compare';
import { deepFreeze } from './deep-freeze';
import { getIn } from './get-in';
import { setIn } from './set-in';
import { removeIn } from './remove-in';
import { getUniqueValues } from './get-unique-values';
import { immutableClone } from './immutable-clone';
import { mergeIn } from './merge-in';
import { pullWithCompare } from './pull-with-compare';
import { validateRenameKey } from './validate-rename-key';

export function processor<EffectType extends EffectTypes>(
  context: ImmutableContext,
  effect: Effect<EffectType>
) {
  const { type, key, value, sliceSize } = effect;
  // TODO
  void sliceSize;

  switch (type) {
    case 'set': {
      immutableClone(context, key, true);

      setIn(context, key, value);

      deepFreeze(context.state);
      break;
    }
    case 'remove': {
      if (key.length === 0) {
        context.state = null;
        return;
      }
      const prevValue = getIn(context, key);
      if (prevValue !== undefined) {
        immutableClone(context, key, true);

        removeIn(context, key);

        deepFreeze(context.state);
      }
      break;
    }
    case 'merge': {
      immutableClone(context, key);

      mergeIn(context, key, value);

      deepFreeze(context.state);
      break;
    }
    case 'setMaximum': {
      const prevValue = getIn(context, key);

      if (
        (value === null && prevValue === undefined) ||
        prevValue == null ||
        (value > prevValue && value !== null)
      ) {
        immutableClone(context, key, true);

        setIn(context, key, value);

        deepFreeze(context.state);
      }
      break;
    }
    case 'setMinimum': {
      const prevValue = getIn(context, key);

      if (value == null || (prevValue !== null && (prevValue === undefined || value < prevValue))) {
        immutableClone(context, key, true);

        setIn(context, key, value);

        deepFreeze(context.state);
      }
      break;
    }
    case 'increment': {
      if (value !== Number(value)) {
        throw new Error(
          `Cannot increment with non-numeric argument: { ${key.join('.')}: ${JSON.stringify(
            value
          )} }`
        );
      }

      let prevValue = getIn(context, key);
      if (prevValue === undefined) {
        prevValue = 0;
      }

      if (prevValue !== Number(prevValue)) {
        throw new Error(
          `Cannot apply $inc to a value of non-numeric type. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-numeric type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      setIn(context, key, prevValue + value);

      deepFreeze(context.state);
      break;
    }
    case 'decrement': {
      if (value !== Number(value)) {
        throw new Error(
          `Cannot increment with non-numeric argument: { ${key.join('.')}: ${JSON.stringify(
            value
          )} }`
        );
      }

      let prevValue = getIn(context, key);
      if (prevValue === undefined) {
        prevValue = 0;
      }

      if (prevValue !== Number(prevValue)) {
        throw new Error(
          `Cannot apply $inc to a value of non-numeric type. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-numeric type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      setIn(context, key, prevValue - value);

      deepFreeze(context.state);
      break;
    }
    case 'multiply': {
      if (value !== Number(value)) {
        throw new Error(
          `Cannot multiply with non-numeric argument: { ${key.join('.')}: ${JSON.stringify(
            value
          )} }`
        );
      }

      let prevValue = getIn(context, key);
      if (prevValue === undefined) {
        prevValue = 0;
      }

      if (prevValue !== Number(prevValue)) {
        throw new Error(
          `Cannot apply $mul to a value of non-numeric type. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-numeric type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      setIn(context, key, prevValue * value);

      deepFreeze(context.state);
      break;
    }
    case 'divide': {
      if (value !== Number(value)) {
        throw new Error(
          `Cannot increment with non-numeric argument: { ${key.join('.')}: ${JSON.stringify(
            value
          )} }`
        );
      }

      let prevValue = getIn(context, key);
      if (prevValue === undefined) {
        prevValue = 0;
      }

      if (prevValue !== Number(prevValue)) {
        throw new Error(
          `Cannot apply $mul to a value of non-numeric type. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-numeric type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      setIn(context, key, prevValue / value);

      deepFreeze(context.state);
      break;
    }
    case 'rename': {
      const newKey = value;

      const prevValue = getIn(context, key);

      if (prevValue !== undefined) {
        validateRenameKey(context, 'source', key);
        validateRenameKey(context, 'destination', newKey);

        immutableClone(context, key, true);
        immutableClone(context, newKey, true);

        setIn(context, newKey, prevValue);

        removeIn(context, key);

        deepFreeze(context.state);
      }
      break;
    }
    case 'addToSet': {
      let prevValue = getIn(context, key);

      if (prevValue === undefined) {
        prevValue = [];
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $addToSet to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = getUniqueValues(prevValue.concat(value));

      setIn(context, key, items);

      deepFreeze(context.state);
      break;
    }
    case 'pushFront': {
      let prevValue = getIn(context, key);

      if (prevValue === undefined) {
        prevValue = [];
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $push to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = [value, prevValue];

      setIn(context, key, items);

      deepFreeze(context.state);
      break;
    }
    case 'popFront': {
      const prevValue = getIn(context, key);

      if (prevValue === undefined) {
        return;
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $pop to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = prevValue.slice(1);

      setIn(context, key, items);

      deepFreeze(context.state);
      break;
    }
    case 'pushBack': {
      let prevValue = getIn(context, key);

      if (prevValue === undefined) {
        prevValue = [];
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $push to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = [prevValue, value];

      setIn(context, key, items);

      deepFreeze(context.state);
      break;
    }
    case 'popBack': {
      const prevValue = getIn(context, key);

      if (prevValue === undefined) {
        return;
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $pop to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = prevValue.slice(0, prevValue.length - 1);

      setIn(context, key, items);

      deepFreeze(context.state);
      break;
    }
    case 'pullIN': {
      let prevValue = getIn(context, key);

      if (prevValue === undefined) {
        prevValue = [];
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $pullAll to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = [].concat(value);

      const itemsLength = items.length;
      const newValues = prevValue.filter((value) => {
        for (let i = 0; i < itemsLength; i++) {
          if (Array.isArray(value)) {
            const valueLength = value.length;
            for (let j = 0; j < valueLength; j++) {
              if (deepCompare(value[j], items[i])) {
                return false;
              }
            }
          }
          if (deepCompare(value, items[i])) {
            return false;
          }
        }
        return true;
      });

      setIn(context, key, newValues);

      deepFreeze(context.state);
      break;
    }
    case 'pullNIN': {
      let prevValue = getIn(context, key);

      if (prevValue === undefined) {
        prevValue = [];
      }

      if (!Array.isArray(prevValue)) {
        throw new Error(
          `Cannot apply $pullAll to non-array field. ${JSON.stringify(
            context.state
          )} has the field ${JSON.stringify(key.join('.'))} of non-array type ${JSON.stringify(
            typeof prevValue
          )}`
        );
      }

      immutableClone(context, key, true);

      const items = [].concat(value);

      const itemsLength = items.length;
      const newValues = prevValue.filter((value) => {
        for (let i = 0; i < itemsLength; i++) {
          if (Array.isArray(value)) {
            const valueLength = value.length;
            for (let j = 0; j < valueLength; j++) {
              if (deepCompare(value[j], items[i])) {
                return true;
              }
            }
          }
          if (deepCompare(value, items[i])) {
            return true;
          }
        }
        return false;
      });

      setIn(context, key, newValues);

      deepFreeze(context.state);
      break;
    }
    case 'pullEQ': {
      pullWithCompare(context, key, value, compareEQ);
      break;
    }
    case 'pullGT': {
      checkPrimitive(value);
      pullWithCompare(context, key, value, compareGT);
      break;
    }
    case 'pullGTE': {
      checkPrimitive(value);
      pullWithCompare(context, key, value, compareGTE);
      break;
    }
    case 'pullLT': {
      checkPrimitive(value);
      pullWithCompare(context, key, value, compareLT);
      break;
    }
    case 'pullLTE': {
      checkPrimitive(value);
      pullWithCompare(context, key, value, compareLTE);
      break;
    }
    case 'pullNE': {
      pullWithCompare(context, key, value, compareEQ, true);
      break;
    }
    case 'get': {
      return getIn(context, key);
    }
  }
}
