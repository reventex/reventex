import { mutationApi } from '../common/mutationApi';

const {
  addToSet,
  decrement,
  divide,
  get,
  increment,
  merge,
  multiply,
  popBack,
  popFront,
  pullEQ,
  pullGT,
  pullGTE,
  pullIN,
  pullLT,
  pullLTE,
  pullNE,
  pullNIN,
  pushBack,
  pushFront,
  remove,
  rename,
  set,
  setMaximum,
  setMinimum,
} = mutationApi;

describe('works correctly', () => {
  const effects: Array<any> = [
    [set, 'a', 'a'],
    [set, 'a.b', 'a'],
    [set, {}],

    [remove, 'a'],
    [remove, 'a.b'],
    [remove],

    [merge, 'a', {}],
    [merge, 'a.b', {}],
    [merge, {}],

    [setMaximum, 'a', 10],
    [setMaximum, 'a.b', 10],

    [setMinimum, 'a', 10],
    [setMinimum, 'a.b', 10],

    [increment, 'a', 10],
    [increment, 'a.b', 10],

    [decrement, 'a', 10],
    [decrement, 'a.b', 10],

    [multiply, 'a', 10],
    [multiply, 'a.b', 10],

    [divide, 'a', 10],
    [divide, 'a.b', 10],

    [rename, 'a', 'b'],
    [rename, 'a.b', 'b.c'],
    [rename, 'a', 'b.c'],
    [rename, 'a.b', 'b'],

    [addToSet, 'a', 10],
    [addToSet, 'a.b', 10],

    [pushFront, 'a', 10],
    [pushFront, 'a.b', 10],

    [popFront, 'a'],
    [popFront, 'a.b'],

    [pushBack, 'a', 10],
    [pushBack, 'a.b', 10],

    [popBack, 'a'],
    [popBack, 'a.b'],

    [pullEQ, 'a', 10],
    [pullEQ, 'a.b', 10],

    [pullGT, 'a', 10],
    [pullGT, 'a.b', 10],

    [pullGTE, 'a', 10],
    [pullGTE, 'a.b', 10],

    [pullLT, 'a', 10],
    [pullLT, 'a.b', 10],

    [pullLTE, 'a', 10],
    [pullLTE, 'a.b', 10],

    [pullNE, 'a', 10],
    [pullNE, 'a.b', 10],

    [pullIN, 'a', [10, 20, 30]],
    [pullIN, 'a.b', [10, 20, 30]],

    [pullNIN, 'a', [10, 20, 30]],
    [pullNIN, 'a.b', [10, 20, 30]],

    [get, 'a'],
    [get, 'a.b'],
    [get],
  ];

  for (const [effectFactory, ...args] of effects) {
    const testName = `${effectFactory.name}(${args
      .map(function (arg: any) {
        return JSON.stringify(arg);
      })
      .join(', ')})`;
    test(testName, () => {
      expect(effectFactory(...args)).toMatchSnapshot();
    });
  }
});
