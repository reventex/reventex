import { beforeEach, describe, test, vitest, type Mock, expect } from 'vitest';
import { run } from './run';
import { call } from './effects';
import { handler } from './handler';
import type { IEffect, ISaga } from './types';

type Context = { handler: Mock<(effect: IEffect) => never> };

describe('method "run"', () => {
  beforeEach<Context>((context) => {
    context.handler = vitest.fn(handler);
  });

  describe('with "calculatorSaga"', () => {
    type ICalculator = {
      plus(acc: { value: number }, val: number): unknown;
      minus(acc: { value: number }, val: number): unknown;
      mul(acc: { value: number }, val: number): unknown;
    };

    const syncCalculator: ICalculator = {
      plus(acc, val) {
        acc.value += val;
      },
      minus(acc, val) {
        acc.value -= val;
      },
      mul(acc, val) {
        acc.value *= val;
      },
    };

    const asyncCalculator: ICalculator = {
      async plus(acc, val) {
        acc.value += val;
      },
      async minus(acc, val) {
        acc.value -= val;
      },
      async mul(acc, val) {
        acc.value *= val;
      },
    };

    function* calculatorSaga(calculator: ICalculator, value: number): ISaga<number> {
      const acc = { value };

      yield* call(calculator.plus, acc, 1);
      yield* call(calculator.minus, acc, 2);
      yield* call(calculator.mul, acc, 3);

      return acc.value;
    }

    test<Context>('should work correctly in sync mode', ({ handler }) => {
      const result = run(calculatorSaga, handler, syncCalculator, 0);

      expect(result).toEqual((0 + 1 - 2) * 3);
      expect(handler).toBeCalledTimes(3);
    });

    test<Context>('should work correctly in async mode', async ({ handler }) => {
      const result = run(calculatorSaga, handler, asyncCalculator, 0);

      await expect(result).resolves.toEqual((0 + 1 - 2) * 3);
      expect(handler).toBeCalledTimes(3);
    });
  });

  describe('with "keyValueSaga"', () => {
    type IKeyValueStorage<T> = {
      get(key: string): T | undefined | Promise<T | undefined>;
      set(key: string, val: T): void;
    };

    class SyncKeyValueStorage<T> implements IKeyValueStorage<T> {
      _map = new Map<string, T>();

      get = (key: string) => {
        return this._map.get(key);
      };

      set = (key: string, value: T) => {
        this._map.set(key, value);
      };
    }

    class AsyncKeyValueStorage<T> implements IKeyValueStorage<T> {
      _map = new Map<string, T>();

      get = async (key: string) => {
        return this._map.get(key);
      };

      set = async (key: string, value: T) => {
        this._map.set(key, value);
      };
    }

    type ITestOperation =
      | { key: string; type: 'set'; value: number }
      | { key: string; type: 'increment' }
      | { key: string; type: 'decrement' };

    function* keyValueStorageSaga(
      storage: IKeyValueStorage<number>,
      operations: ITestOperation[],
    ): ISaga<Record<string, number>> {
      const keys = new Set<string>();

      for (const operation of operations) {
        keys.add(operation.key);
        switch (operation.type) {
          case 'set': {
            yield* call(storage.set, operation.key, operation.value);
            break;
          }
          case 'increment': {
            const value = yield* call(storage.get, operation.key);
            yield* call(storage.set, operation.key, (value ?? 0) + 1);
            break;
          }
          case 'decrement': {
            const value = yield* call(storage.get, operation.key);
            yield* call(storage.set, operation.key, (value ?? 0) - 1);
            break;
          }
        }
      }

      const result: Record<string, number> = {};
      for (const key of keys) {
        result[key] = (yield* call(storage.get, key))!;
      }
      return result;
    }

    const operations: ITestOperation[] = [
      { type: 'set', key: 'a', value: 1 },
      { type: 'set', key: 'b', value: 5 },
      { type: 'set', key: 'c', value: 7 },
      { type: 'increment', key: 'a' },
      { type: 'increment', key: 'a' },
      { type: 'decrement', key: 'b' },
    ];

    const expectedResult = { a: 1 + 1 + 1, b: 5 - 1, c: 7 };

    test<Context>('should work correctly in sync mode', ({ handler }) => {
      const result = run(keyValueStorageSaga, handler, new SyncKeyValueStorage(), operations);

      expect(result).toEqual(expectedResult);
    });

    test<Context>('should work correctly in async mode', async ({ handler }) => {
      const result = run(keyValueStorageSaga, handler, new AsyncKeyValueStorage(), operations);

      await expect(result).resolves.toEqual(expectedResult);
    });
  });

  describe('with "helloWorldSaga"', () => {
    const helloWorld = 'Hello world!';

    function* helloWorldSaga(): ISaga<string> {
      return helloWorld;
    }

    test<Context>('should work correctly ', ({ handler }) => {
      const result = run(helloWorldSaga, handler);

      expect(handler).toBeCalledTimes(0);
      expect(result).toEqual(helloWorld);
    });
  });

  describe('with "voidSaga"', () => {
    function* voidSaga(): ISaga<void> {}

    test<Context>('should work correctly', ({ handler }) => {
      const result = run(voidSaga, handler);

      expect(handler).toBeCalledTimes(0);
      expect(result).toBeUndefined();
    });
  });

  describe('with "syncSumSaga"', () => {
    function sum(a: number, b: number) {
      return a + b;
    }

    function* syncSumSaga(a: number, b: number): ISaga<number> {
      return yield* call(sum, a, b);
    }

    test<Context>('should work correctly ', ({ handler }) => {
      const result = run(syncSumSaga, handler, 1, 2);

      expect(result).toEqual(1 + 2);
      expect(handler).toBeCalledTimes(1);
    });
  });

  describe('with "asyncSumSaga"', () => {
    async function sum(a: number, b: number) {
      return a + b;
    }

    function* asyncSumSaga(a: number, b: number): ISaga<number> {
      return yield* call(sum, a, b);
    }

    test<Context>('should work correctly ', async ({ handler }) => {
      const result = run(asyncSumSaga, handler, 1, 2);

      await expect(result).resolves.toEqual(1 + 2);
      expect(handler).toBeCalledTimes(1);
    });
  });
});
