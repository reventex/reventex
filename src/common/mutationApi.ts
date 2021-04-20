import { normalizeArgsK, normalizeArgsKK, normalizeArgsKV, normalizeArgsKVS } from './normalize';
import { MutationApi } from './types';

export const mutationApi: MutationApi = {
  set(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'set',
      key,
      value,
    };
  },
  remove(...args) {
    const [key] = normalizeArgsK(args);
    return {
      type: 'remove',
      key,
    };
  },
  merge(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'merge',
      key,
      value,
    };
  },
  setMaximum(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'setMaximum',
      key,
      value,
    };
  },
  setMinimum(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'setMinimum',
      key,
      value,
    };
  },
  increment(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'increment',
      key,
      value,
    };
  },
  decrement(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'decrement',
      key,
      value,
    };
  },
  multiply(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'multiply',
      key,
      value,
    };
  },
  divide(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'divide',
      key,
      value,
    };
  },
  rename(...args) {
    const [key, nextKey] = normalizeArgsKK(args);
    return {
      type: 'rename',
      key,
      value: nextKey,
    };
  },
  addToSet(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'addToSet',
      key,
      value,
    };
  },
  pushFront(...args) {
    const [key, value, sliceSize] = normalizeArgsKVS(args);
    return {
      type: 'pushFront',
      key,
      value,
      sliceSize,
    };
  },
  popFront(...args) {
    const [key] = normalizeArgsK(args);
    return {
      type: 'popFront',
      key,
    };
  },
  pushBack(...args) {
    const [key, value, sliceSize] = normalizeArgsKVS(args);
    return {
      type: 'pushBack',
      key,
      value,
      sliceSize,
    };
  },
  popBack(...args) {
    const [key] = normalizeArgsK(args);
    return {
      type: 'popBack',
      key,
    };
  },
  pullEQ(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullEQ',
      key,
      value,
    };
  },
  pullGT(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullGT',
      key,
      value,
    };
  },
  pullGTE(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullGTE',
      key,
      value,
    };
  },
  pullLT(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullLT',
      key,
      value,
    };
  },
  pullLTE(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullLTE',
      key,
      value,
    };
  },
  pullNE(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullNE',
      key,
      value,
    };
  },
  pullIN(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullIN',
      key,
      value,
    };
  },
  pullNIN(...args) {
    const [key, value] = normalizeArgsKV(args);
    return {
      type: 'pullNIN',
      key,
      value,
    };
  },
  get(...args) {
    const [key] = normalizeArgsK(args);
    return {
      type: 'get',
      key,
    };
  },
};
