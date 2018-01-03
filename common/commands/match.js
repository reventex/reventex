import { MatchRegExp } from '../MatchRegExp';
import { CommandType } from '../CommandType';
import { symbol } from '../symbol';

export function match(pattern, generator) {
    if (!('type' in pattern) && !('channel' in pattern)) {
        throw new Error(
            'Missing required parameter "pattern.type" or "pattern.channel"',
        );
    }
    if ('type' in pattern && typeof pattern.type !== 'string') {
        throw new Error('Parameter "pattern.type" must be a string');
    }
    if ('channel' in pattern && typeof pattern.channel !== 'string') {
        throw new Error('Parameter "pattern.channel" must be a string');
    }

    return Object.create(null, {
        [symbol]: {
            enumerable: false,
            writable: false,
            configurable: false,
            value: CommandType.MATCH,
        },
        pattern: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: Object.create(null, {
                type: {
                    enumerable: true,
                    writable: false,
                    configurable: false,
                    value: pattern.type,
                },
                channel: {
                    enumerable: true,
                    writable: false,
                    configurable: false,
                    value: pattern.channel,
                },
                regExp: {
                    enumerable: true,
                    writable: false,
                    configurable: false,
                    value: pattern.channel
                        ? new MatchRegExp(pattern.channel)
                        : undefined,
                },
            }),
        },
        generator: {
            enumerable: true,
            writable: false,
            configurable: false,
            value: generator,
        },
    });
}
