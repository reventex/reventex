import { call } from './call';
import { delay } from './delay';
import { match } from './match';
import { publish } from './publish';
import { subscribe } from './subscribe';
import { unsubscribe } from './unsubscribe';

export const commandExecutors = {
    call,
    delay,
    match,
    publish,
    subscribe,
    unsubscribe,
};
