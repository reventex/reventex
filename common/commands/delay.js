import { CommandType } from '../CommandType';
import { symbol } from '../symbol';

export function delay(ms) {
    return Object.create(null, {
        [symbol]: {
            enumerable: false,
            writable: false,
            configurable: false,
            value: CommandType.DELAY,
        },
        ms: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: ms,
        },
    });
}
