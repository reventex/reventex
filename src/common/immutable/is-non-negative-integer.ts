import type { TValue } from '../types/event-sourcing';

export function isNonNegativeInteger(value: TValue): value is number {
  return value == parseInt(value, 10) && value >= 0;
}
