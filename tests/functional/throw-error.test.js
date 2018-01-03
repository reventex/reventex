import { Client, Bus } from 'reventex/server';

const channel = 'throw-error';

it('throw-error', async () => {
    function* throwError({ subscribe, match, call, exit }) {
        yield subscribe(channel);

        yield match({ channel }, function*(event, { exit }) {
            yield exit();
        });

        yield call(() => {
            throw new Error();
        });

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(throwError, bus);

    try {
        await client.run();
    } catch (error) {
        return;
    }

    throw new Error();
});
