import { Client, Bus } from 'reventex/server';

const EventType = {
    BOOM: 'BOOM',
    CRASH: 'CRASH',
    WOW: 'WOW',
};

function simpleSort(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

it('simple', async () => {
    let event1,
        event2,
        event3,
        events = [];

    function* simple({ subscribe, publish, match, delay, exit }) {
        yield subscribe('simple');

        yield match({ type: EventType.BOOM }, function*(event) {
            if (event1) throw new Error();
            event1 = event.type;
        });

        yield match({ type: EventType.CRASH }, function*(event) {
            if (event2) throw new Error();
            event2 = event.type;
        });

        yield match({ type: EventType.WOW }, function*(event) {
            if (event3) throw new Error();
            event3 = event.type;
        });

        yield match({ channel: 'simple' }, function*(event) {
            events.push(event.type);
        });

        yield publish({
            channel: 'simple',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'simple',
            type: EventType.CRASH,
        });
        yield publish({
            channel: 'simple',
            type: EventType.WOW,
        });

        yield delay(500);

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(simple, bus);

    await client.run();

    expect(event1).toEqual(EventType.BOOM);
    expect(event2).toEqual(EventType.CRASH);
    expect(event3).toEqual(EventType.WOW);
    expect(events.sort(simpleSort)).toEqual(
        [EventType.BOOM, EventType.CRASH, EventType.WOW].sort(simpleSort),
    );
});

it('two channels', async () => {
    const firstEvents = [];
    const secondEvents = [];

    function* twoChannels({ subscribe, publish, match, delay, exit }) {
        yield subscribe('first');
        yield subscribe('second');

        yield match({ channel: 'first' }, function*(event) {
            firstEvents.push(event.type);
        });

        yield match({ channel: 'second' }, function*(event) {
            secondEvents.push(event.type);
        });

        yield publish({
            channel: 'first',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'first',
            type: EventType.CRASH,
        });
        yield publish({
            channel: 'second',
            type: EventType.WOW,
        });
        yield publish({
            channel: 'second',
            type: EventType.BOOM,
        });

        yield delay(500);

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(twoChannels, bus);

    await client.run();

    expect(firstEvents.sort(simpleSort)).toEqual(
        [EventType.BOOM, EventType.CRASH].sort(simpleSort),
    );
    expect(secondEvents.sort(simpleSort)).toEqual(
        [EventType.WOW, EventType.BOOM].sort(simpleSort),
    );
});

it('intersecting sets', async () => {
    const xyz = [];
    const xyO = [];
    const xOz = [];
    const xOO = [];
    const Oyz = [];
    const OyO = [];
    const OOz = [];
    const OOO = [];

    function* stars({ subscribe, publish, match, delay, exit }) {
        yield subscribe('x.y.z');
        yield subscribe('x.y.*');
        yield subscribe('x.*.z');
        yield subscribe('x.*.*');
        yield subscribe('*.y.z');
        yield subscribe('*.y.*');
        yield subscribe('*.*.z');

        yield subscribe('a.a.a');
        yield subscribe('a.a.*');
        yield subscribe('a.*.a');
        yield subscribe('a.*.*');
        yield subscribe('*.a.a');
        yield subscribe('*.a.*');
        yield subscribe('*.*.a');

        yield match({ channel: 'x.y.z' }, function*(event) {
            xyz.push(event.channel);
        });

        yield match({ channel: 'x.y.*' }, function*(event) {
            xyO.push(event.channel);
        });

        yield match({ channel: 'x.*.z' }, function*(event) {
            xOz.push(event.channel);
        });

        yield match({ channel: 'x.*.*' }, function*(event) {
            xOO.push(event.channel);
        });

        yield match({ channel: '*.y.z' }, function*(event) {
            Oyz.push(event.channel);
        });

        yield match({ channel: '*.y.*' }, function*(event) {
            OyO.push(event.channel);
        });

        yield match({ channel: '*.*.z' }, function*(event) {
            OOz.push(event.channel);
        });

        yield match({ channel: '*.*.*' }, function*(event) {
            OOO.push(event.channel);
        });

        yield publish({
            channel: 'x.y.z',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'x.y.a',
            type: EventType.WOW,
        });
        yield publish({
            channel: 'x.a.z',
            type: EventType.CRASH,
        });
        yield publish({
            channel: 'a.y.z',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'x.a.a',
            type: EventType.WOW,
        });
        yield publish({
            channel: 'a.y.a',
            type: EventType.CRASH,
        });
        yield publish({
            channel: 'a.a.z',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'a.a.a',
            type: EventType.WOW,
        });

        yield delay(500);

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(stars, bus);

    await client.run();

    expect(xyz.sort(simpleSort)).toEqual(['x.y.z'].sort(simpleSort));
    expect(xyO.sort(simpleSort)).toEqual(['x.y.a', 'x.y.z'].sort(simpleSort));
    expect(xOz.sort(simpleSort)).toEqual(['x.a.z', 'x.y.z'].sort(simpleSort));
    expect(xOO.sort(simpleSort)).toEqual(
        ['x.a.a', 'x.a.z', 'x.y.a', 'x.y.z'].sort(simpleSort),
    );
    expect(Oyz.sort(simpleSort)).toEqual(['a.y.z', 'x.y.z'].sort(simpleSort));
    expect(OyO.sort(simpleSort)).toEqual(
        ['a.y.a', 'a.y.z', 'x.y.a', 'x.y.z'].sort(simpleSort),
    );
    expect(OOz.sort(simpleSort)).toEqual(
        ['a.a.z', 'a.y.z', 'x.a.z', 'x.y.z'].sort(simpleSort),
    );
    expect(OOO.sort(simpleSort)).toEqual(
        [
            'a.a.a',
            'a.a.z',
            'a.y.a',
            'a.y.z',
            'x.a.a',
            'x.a.z',
            'x.y.a',
            'x.y.z',
        ].sort(simpleSort),
    );
});

it('absorbing sets', async () => {
    const xyz = [];
    const xyO = [];
    const xOz = [];
    const xOO = [];
    const Oyz = [];
    const OyO = [];
    const OOz = [];
    const OOO = [];

    function* stars({ subscribe, publish, match, delay, exit }) {
        yield subscribe('x.y.z');
        yield subscribe('x.y.*');
        yield subscribe('x.*.z');
        yield subscribe('x.*.*');
        yield subscribe('*.y.z');
        yield subscribe('*.y.*');
        yield subscribe('*.*.z');
        yield subscribe('*.>');
        yield subscribe('>');

        yield match({ channel: 'x.y.z' }, function*(event) {
            xyz.push(event.channel);
        });

        yield match({ channel: 'x.y.*' }, function*(event) {
            xyO.push(event.channel);
        });

        yield match({ channel: 'x.*.z' }, function*(event) {
            xOz.push(event.channel);
        });

        yield match({ channel: 'x.*.*' }, function*(event) {
            xOO.push(event.channel);
        });

        yield match({ channel: '*.y.z' }, function*(event) {
            Oyz.push(event.channel);
        });

        yield match({ channel: '*.y.*' }, function*(event) {
            OyO.push(event.channel);
        });

        yield match({ channel: '*.*.z' }, function*(event) {
            OOz.push(event.channel);
        });

        yield match({ channel: '*.*.*' }, function*(event) {
            OOO.push(event.channel);
        });

        yield publish({
            channel: 'x.y.z',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'x.y.a',
            type: EventType.WOW,
        });
        yield publish({
            channel: 'x.a.z',
            type: EventType.CRASH,
        });
        yield publish({
            channel: 'a.y.z',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'x.a.a',
            type: EventType.WOW,
        });
        yield publish({
            channel: 'a.y.a',
            type: EventType.CRASH,
        });
        yield publish({
            channel: 'a.a.z',
            type: EventType.BOOM,
        });
        yield publish({
            channel: 'a.a.a',
            type: EventType.WOW,
        });

        yield delay(500);

        yield exit();
    }

    const bus = new Bus();
    const client = new Client(stars, bus);

    await client.run();

    expect(xyz.sort(simpleSort)).toEqual(['x.y.z'].sort(simpleSort));
    expect(xyO.sort(simpleSort)).toEqual(['x.y.a', 'x.y.z'].sort(simpleSort));
    expect(xOz.sort(simpleSort)).toEqual(['x.a.z', 'x.y.z'].sort(simpleSort));
    expect(xOO.sort(simpleSort)).toEqual(
        ['x.a.a', 'x.a.z', 'x.y.a', 'x.y.z'].sort(simpleSort),
    );
    expect(Oyz.sort(simpleSort)).toEqual(['a.y.z', 'x.y.z'].sort(simpleSort));
    expect(OyO.sort(simpleSort)).toEqual(
        ['a.y.a', 'a.y.z', 'x.y.a', 'x.y.z'].sort(simpleSort),
    );
    expect(OOz.sort(simpleSort)).toEqual(
        ['a.a.z', 'a.y.z', 'x.a.z', 'x.y.z'].sort(simpleSort),
    );
    expect(OOO.sort(simpleSort)).toEqual(
        [
            'a.a.a',
            'a.a.z',
            'a.y.a',
            'a.y.z',
            'x.a.a',
            'x.a.z',
            'x.y.a',
            'x.y.z',
        ].sort(simpleSort),
    );
});
