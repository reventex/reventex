import { EntityId } from './entity-id';

function wrap(value: EntityId | Array<any> | { [key: string]: any }): any {
  if (value instanceof EntityId) {
    return { t: 'e', v: [value.entityName, value.documentId] };
  }
  if (Array.isArray(value)) {
    return recursiveWrap(value);
  } else if (value === Object(value)) {
    return { t: 'o', v: recursiveWrap(value) };
  } else {
    return recursiveWrap(value);
  }
}

function recursiveWrap(source: EntityId | Array<any> | { [key: string]: any }) {
  if (Array.isArray(source)) {
    return source.map((value) => wrap(value));
  } else if (source === Object(source)) {
    const copyValue: { [key: string]: any } = {};
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      copyValue[key] = wrap((source as { [key: string]: any })[key] as { [key: string]: any });
    }
    return copyValue;
  } else {
    return source;
  }
}

export const serialize = (events: Array<any>): string => {
  const eventCount = events.length;
  const result = [];
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
    const event = events[eventIndex];
    result.push({
      ...event,
      payload: recursiveWrap(event.payload),
    });
  }
  return JSON.stringify(result);
};
