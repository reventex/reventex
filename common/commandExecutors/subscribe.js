import { commands } from '../commands';
import { iterate } from '../iterate';
import { CommandType } from '../CommandType';
import { commandExecutors } from '../commandExecutors';

export function subscribe(effect, context) {
    const { bus, subscriptions, matches, storage, uuid } = context;

    const nextSubscriptions = subscriptions.filter(
        ({ channel }) => channel !== effect.channel,
    );

    const sid = bus.subscribe(effect.channel, { queue: uuid }, message => {
        const event = JSON.parse(message);

        for (const { pattern, generator } of matches) {
            if (
                event.type === pattern.type ||
                (pattern.regExp && pattern.regExp.test(event.channel))
            ) {
                const iterator = generator(event, commands, storage);
                iterate(
                    {
                        [CommandType.PUBLISH]: commandExecutors.publish,
                        [CommandType.DELAY]: commandExecutors.delay,
                        [CommandType.CALL]: commandExecutors.call,
                    },
                    iterator,
                    context,
                );
            }
        }
    });

    nextSubscriptions.push({
        channel: effect.channel,
        sid,
    });

    context.subscriptions = nextSubscriptions;
}
