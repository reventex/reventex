import { CommandType } from '../CommandType';
import { symbol } from '../symbol';

export function publish(event) {
    if (typeof event.type !== 'string') {
        throw new Error('Parameter "event.type" must be a string');
    }
    if (typeof event.channel !== 'string') {
        throw new Error('Parameter "event.channel" must be a string');
    }

    return Object.create(null, {
        [symbol]: {
            enumerable: false,
            writable: false,
            configurable: false,
            value: CommandType.PUBLISH,
        },
        event: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: event,
        },
    });
}
