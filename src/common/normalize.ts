import { TKey, TStrictKey, TValue } from './types';
import { prepareKey } from './prepare-key';

export const normalizeArgsKVS = (args: Array<any>): [TStrictKey, TValue, number | undefined] => {
  switch (args.length) {
    case 1: {
      const key: TStrictKey = [];
      const value = args[0];
      return [key, value, undefined];
    }
    case 2:
    case 3: {
      const key: TKey = args[0];
      const value = args[1];
      const sliceSize = args[2];
      return [prepareKey(key), value, sliceSize];
    }
    default: {
      throw new TypeError();
    }
  }
};

export const normalizeArgsKK = (args: Array<any>): [TStrictKey, TStrictKey] => {
  switch (args.length) {
    case 2: {
      const key: TKey = args[0];
      const newKey: TKey = args[1];
      return [prepareKey(key), prepareKey(newKey)];
    }
    default: {
      throw new TypeError();
    }
  }
};

export const normalizeArgsKV = (args: Array<any>): [TStrictKey, TValue] => {
  switch (args.length) {
    case 1: {
      const key: TStrictKey = [];
      const value: TValue = args[0];
      return [key, value];
    }
    case 2: {
      const key: TKey = args[0];
      const value: TValue = args[1];
      return [prepareKey(key), value];
    }
    default: {
      throw new TypeError();
    }
  }
};

export const normalizeArgsK = (args: Array<any>): [TStrictKey] => {
  switch (args.length) {
    case 0: {
      const key: TStrictKey = [];
      return [key];
    }
    case 1: {
      const key: TKey = args[0];
      return [prepareKey(key)];
    }
    default: {
      throw new TypeError();
    }
  }
};
