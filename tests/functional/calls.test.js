import { Client, Bus } from 'reventex/server';

function get42() {
    return 42;
}

function sum(a, b) {
    return a + b;
}

function fetch() {
    return new Promise(resolve => {
        setTimeout(() => resolve('ok'), 10);
    });
}

it('calls', async () => {
    function* calls({ exit, call }) {
        const value = yield call(get42);
        expect(value).toEqual(value);

        const result = yield call(sum, 5, 10);
        expect(result).toEqual(15);

        const ok = yield call(fetch);
        expect(ok).toEqual('ok');

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(calls, bus);

    await client.run();
});
