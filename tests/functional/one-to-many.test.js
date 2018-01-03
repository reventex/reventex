import { Client, Bus } from 'reventex/server';

const EventType = {
    TEST: 'TEST',
};

const channel = 'one-to-many';

it('one-to-many', async () => {
    function* one({ subscribe, match }) {
        yield subscribe(channel);

        yield match({ type: EventType.TEST }, function*(event, { exit }) {
            yield exit();
        });
    }

    function* two({ subscribe, match }) {
        yield subscribe(channel);

        yield match({ type: EventType.TEST }, function*(event, { exit }) {
            yield exit();
        });
    }

    function* three({ subscribe, publish, exit }) {
        yield subscribe(channel);

        yield publish({
            channel,
            type: EventType.TEST,
        });

        yield exit();
    }

    const bus = new Bus();
    const clients = new Client([one, two, three], bus);

    await clients.run();
});
