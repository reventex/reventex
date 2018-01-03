import { Client, Bus } from 'reventex/server';

const channel = 'unknown-command';

function unknown() {}

it('unknown-command', async () => {
    function* unknownCommand({ subscribe, match, call, exit }) {
        yield subscribe(channel);

        yield match({ channel }, function*(event, { exit }) {
            yield exit();
        });

        yield unknown();

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(unknownCommand, bus);

    try {
        await client.run();
    } catch (error) {
        return;
    }

    throw new Error();
});
