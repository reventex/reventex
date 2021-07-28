import { ImmutableContext, TStrictKey, TValue } from '../types';
import { isNonNegativeInteger } from './is-non-negative-integer';

export function mergeIn(context: ImmutableContext, key: TStrictKey, value: TValue) {
  if (value == null || value.constructor !== Object) {
    throw new Error(`${JSON.stringify(value)} must be object`);
  }

  const state = context.state;

  const lastKeyIndex = key.length;

  let pointer = state;
  for (let index = 0; index < lastKeyIndex; index++) {
    const subKey: any = key[index];
    pointer = pointer[subKey];
  }

  const isArray = Array.isArray(pointer);

  for (const valueKey in value) {
    if (Object.prototype.hasOwnProperty.call(value, valueKey)) {
      if (Object(pointer) !== pointer || (isArray && !isNonNegativeInteger(valueKey))) {
        throw new Error(`Cannot create field ${JSON.stringify(valueKey)} in element ${JSON.stringify(pointer)}`);
      }
      const subValue = value[valueKey];
      pointer[valueKey] = subValue == null ? null : subValue;
    }
  }

  if (isArray) {
    for (let arrIndex = 0; arrIndex < pointer.length; arrIndex++) {
      if (pointer[arrIndex] === undefined) {
        pointer[arrIndex] = null;
      }
    }
  }
}
