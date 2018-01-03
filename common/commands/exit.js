import { CommandType } from '../CommandType';
import { symbol } from '../symbol';

export function exit() {
    return Object.create(null, {
        [symbol]: {
            enumerable: false,
            writable: false,
            configurable: false,
            value: CommandType.EXIT,
        },
    });
}
