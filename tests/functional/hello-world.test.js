import { Client, Bus } from 'reventex/server';

const EventType = {
    HELLO: 'HELLO',
};

const channel = 'hello-world';

it('hello-world', async () => {
    function* helloWorld({ subscribe, publish, match }) {
        yield subscribe(channel);

        yield match({ type: EventType.HELLO }, function*(event, { exit }) {
            expect(event.payload.name).toEqual('world');
            yield exit();
        });

        yield publish({
            channel,
            type: EventType.HELLO,
            payload: {
                name: 'world',
            },
        });
    }

    const bus = new Bus();
    const client = new Client(helloWorld, bus);

    await client.run();
});
