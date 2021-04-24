import { TValue } from '../types';

export function isNonNegativeInteger(value: TValue): value is number {
  return value == parseInt(value, 10) && value >= 0;
}
