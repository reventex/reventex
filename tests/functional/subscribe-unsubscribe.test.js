import { Client, Bus } from 'reventex/server';

const EventType = {
    FIRST: 'FIRST',
    SECOND: 'SECOND',
};

const channel = 'subscribe-unsubscribe';

it('subscribe-unsubscribe', async () => {
    const events = [];

    function* test({ subscribe, unsubscribe, publish, match, delay, exit }) {
        yield subscribe(channel);

        yield match({ channel }, function*(event) {
            events.push(event);
        });

        yield publish({
            channel,
            type: EventType.FIRST,
        });

        yield unsubscribe(channel);

        yield publish({
            channel,
            type: EventType.SECOND,
        });

        yield delay(500);

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(test, bus);

    await client.run();

    expect(events.length).toEqual(1);
});
