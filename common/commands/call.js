import { CommandType } from '../CommandType';
import { symbol } from '../symbol';

export function call(callback, ...args) {
    return Object.create(null, {
        [symbol]: {
            enumerable: false,
            writable: false,
            configurable: false,
            value: CommandType.CALL,
        },
        callback: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: callback,
        },
        args: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: args,
        },
    });
}
