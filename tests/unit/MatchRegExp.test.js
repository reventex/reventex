import { MatchRegExp } from 'reventex/common/MatchRegExp';

it('MatchRegExp', () => {
    const regexp1 = new MatchRegExp('>');
    const regexp2 = new MatchRegExp('test.>');
    const regexp3 = new MatchRegExp('hello.*');
    const regexp4 = new MatchRegExp('hello.*.world');
    const regexp5 = new MatchRegExp('world');
    const regexp6 = new MatchRegExp('x.y');
    const regexp7 = new MatchRegExp('x.*');
    const regexp8 = new MatchRegExp('*.y');
    const regexp9 = new MatchRegExp('*.*');

    expect(regexp1.test('test')).toEqual(true);
    expect(regexp1.test('hello.world')).toEqual(true);
    expect(regexp1.test('hello.world.test')).toEqual(true);

    expect(regexp2.test('test')).toEqual(false);
    expect(regexp2.test('world')).toEqual(false);
    expect(regexp2.test('test.hello')).toEqual(true);
    expect(regexp2.test('test.hello.world')).toEqual(true);

    expect(regexp3.test('test')).toEqual(false);
    expect(regexp3.test('hello')).toEqual(false);
    expect(regexp3.test('hello.world')).toEqual(true);
    expect(regexp3.test('hello.world.test')).toEqual(false);

    expect(regexp4.test('hello.world')).toEqual(false);
    expect(regexp4.test('hello.test.world')).toEqual(true);
    expect(regexp4.test('hello.hello.world')).toEqual(true);
    expect(regexp4.test('hello.hello.hello.world')).toEqual(false);
    expect(regexp4.test('hello.hello.world.hello')).toEqual(false);
    expect(regexp4.test('hello.hello.world123')).toEqual(false);

    expect(regexp5.test('world')).toEqual(true);
    expect(regexp5.test('1world')).toEqual(false);
    expect(regexp5.test('world1')).toEqual(false);
    expect(regexp5.test('test')).toEqual(false);
    expect(regexp5.test('world.test')).toEqual(false);
    expect(regexp5.test('world.world')).toEqual(false);

    expect(regexp6.test('x.y')).toEqual(true);
    expect(regexp6.test('x.a')).toEqual(false);
    expect(regexp6.test('a.y')).toEqual(false);
    expect(regexp6.test('a.y')).toEqual(false);
    expect(regexp6.test('a.a')).toEqual(false);

    expect(regexp7.test('x.y')).toEqual(true);
    expect(regexp7.test('x.a')).toEqual(true);
    expect(regexp7.test('a.y')).toEqual(false);
    expect(regexp7.test('a.y')).toEqual(false);
    expect(regexp7.test('a.a')).toEqual(false);

    expect(regexp8.test('x.y')).toEqual(true);
    expect(regexp8.test('x.a')).toEqual(false);
    expect(regexp8.test('a.y')).toEqual(true);
    expect(regexp8.test('a.y')).toEqual(true);
    expect(regexp8.test('a.a')).toEqual(false);

    expect(regexp9.test('x.y')).toEqual(true);
    expect(regexp9.test('x.a')).toEqual(true);
    expect(regexp9.test('a.y')).toEqual(true);
    expect(regexp9.test('a.y')).toEqual(true);
    expect(regexp9.test('a.a')).toEqual(true);

    expect(() => new MatchRegExp('x.>.y')).toThrow();
    expect(() => new MatchRegExp('x.$')).toThrow();
});
