import { TValue } from '../types';
import { compareEQ } from './compare';

export function deepCompare(a: TValue = null, b: TValue = null, compare = compareEQ) {
  const isNullA = a === null;
  const isNullB = b === null;
  if (!isNullA && isNullB) {
    return false;
  } else if (isNullA && !isNullB) {
    return false;
  } else if (isNullA && isNullB) {
    return compare(a, b);
  }
  const isNaNA = a !== a;
  const isNaNB = b !== b;
  if (!isNaNA && isNaNB) {
    return false;
  } else if (isNaNA && !isNaNB) {
    return false;
  } else if (isNaNA && isNaNB) {
    return compare(a, b);
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);
  if (isArrayA && isArrayB) {
    const length = a.length;
    if (length !== b.length) {
      return false;
    }
    for (let i = length; i-- !== 0; ) {
      if (!deepCompare(a[i], b[i], compare)) {
        return false;
      }
    }

    return true;
  } else if (isArrayA && !isArrayB) {
    return false;
  } else if (!isArrayA && isArrayB) {
    return false;
  }
  const isObjectA = Object(a) === a;
  const isObjectB = Object(b) === b;
  if (isObjectA && isObjectB) {
    const keys = Object.keys(a);
    const length = keys.length;

    if (keys.toString().indexOf(Object.keys(b).toString()) !== 0) {
      return false;
    }

    for (let i = length; i-- !== 0; ) {
      const key: any = keys[i];
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
    }

    for (let i = length; i-- !== 0; ) {
      const key: any = keys[i];
      if (!deepCompare(a[key], b[key], compare)) {
        return false;
      }
    }

    return true;
  } else if (isObjectA && !isObjectB) {
    return false;
  } else if (!isObjectA && isObjectB) {
    return false;
  }

  return compare(a, b);
}
