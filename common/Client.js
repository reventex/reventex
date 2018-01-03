import uuid from 'uuid/v4';

import { commands } from './commands';
import { commandExecutors } from './commandExecutors';
import { iterate } from './iterate';
import { CommandType } from './CommandType';

export class Client {
    constructor(generators, bus, storage = {}) {
        this.generators = Array.isArray(generators) ? generators : [generators];
        this.bus = bus;
        this.storage = storage;
    }

    run() {
        return new Promise((resolve, reject) => {
            this.generators.forEach(generator =>
                iterate(
                    {
                        [CommandType.PUBLISH]: commandExecutors.publish,
                        [CommandType.SUBSCRIBE]: commandExecutors.subscribe,
                        [CommandType.UNSUBSCRIBE]: commandExecutors.unsubscribe,
                        [CommandType.MATCH]: commandExecutors.match,
                        [CommandType.DELAY]: commandExecutors.delay,
                        [CommandType.CALL]: commandExecutors.call,
                    },
                    generator(commands, this.storage),
                    {
                        bus: this.bus,
                        storage: this.storage,
                        matches: [],
                        subscriptions: [],
                        resolve,
                        reject,
                        uuid: uuid(),
                    },
                ),
            );
        })
            .then(() => {
                this.bus.close();
            })
            .catch(error => {
                this.bus.close();
                throw error;
            });
    }
}
