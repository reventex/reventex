import { Client, Bus } from 'reventex/server';

const EventType = {
    PING: 'PING',
    PONG: 'PONG',
};

const channel = 'ping-pong';

it('ping-pong', async () => {
    function* ping({ subscribe, publish, match }) {
        yield subscribe(channel);

        yield match({ type: EventType.PONG }, function*(event, { exit }) {
            yield exit();
        });

        yield publish({
            channel,
            type: EventType.PING,
        });
    }

    function* pong({ subscribe, match }) {
        yield subscribe(channel);

        yield match({ type: EventType.PING }, function*(
            event,
            { publish, exit },
        ) {
            yield publish({
                channel,
                type: EventType.PONG,
            });
            yield exit();
        });
    }

    const bus = new Bus();
    const clients = new Client([ping, pong], bus);

    await clients.run();
});
