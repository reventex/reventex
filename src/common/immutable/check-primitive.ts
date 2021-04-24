import { TValue } from '../types';

export function checkPrimitive(value: TValue) {
  if (value == null) {
    return;
  }
  const constructor = value.constructor;
  if (constructor === Object || constructor === Array) {
    throw `${JSON.stringify(value)} must be primitive or Date`;
  }
}
