import { entityId } from './entity-id';

function unwrap(value: { t: string; v: [string, string] }): any {
  if (Array.isArray(value)) {
    return recursiveUnwrap(value);
  } else if (value === Object(value)) {
    if (value.t === 'e') {
      return entityId(value.v[0], value.v[1]);
    } else if (value.t === 'o') {
      return recursiveUnwrap(value.v);
    } else {
      throw new Error(`Incorrect value ${JSON.stringify(value)}`);
    }
  } else {
    return recursiveUnwrap(value);
  }
}

function recursiveUnwrap(source: Array<any> | { [key: string]: any } | any): any {
  if (Array.isArray(source)) {
    return source.map((value) => unwrap(value));
  } else if (source === Object(source)) {
    const copyValue: { [key: string]: any } = {};
    for (const key in source) {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        continue;
      }
      copyValue[key] = unwrap(source[key]);
    }
    return copyValue;
  } else {
    return source;
  }
}

export function deserialize(eventsAsString: string): Array<any> {
  const events = JSON.parse(eventsAsString);
  const eventCount = events.length;
  for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
    const event = events[eventIndex];
    if (Object.prototype.hasOwnProperty.call(event, 'payload')) {
      event.payload = recursiveUnwrap(event.payload);
    }
  }
  return events;
}
