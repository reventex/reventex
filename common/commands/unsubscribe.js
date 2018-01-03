import { CommandType } from '../CommandType';
import { symbol } from '../symbol';

export function unsubscribe(channel) {
    if (typeof channel !== 'string') {
        throw new Error('Argument "channel" must be a string');
    }

    return Object.create(null, {
        [symbol]: {
            enumerable: false,
            writable: false,
            configurable: false,
            value: CommandType.UNSUBSCRIBE,
        },
        channel: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: channel,
        },
    });
}
