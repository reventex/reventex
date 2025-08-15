import isPromise from 'is-promise';

const brandedVoid = Symbol();

function runGeneratorWithInnerState<TYield, TReturn>(
  generator: Generator<TYield, TReturn, never>,
  handler: (effect: TYield) => never,
  startStep: IteratorYieldResult<TYield> | IteratorReturnResult<TReturn>,
  state: { value: TYield | TReturn; result: any },
): TReturn | Promise<TReturn> {
  let step = startStep;

  while (!step.done) {
    if (isPromise(state.value)) {
      return (state.value as unknown as Promise<TYield>).then((unboundValue) => {
        state.value = unboundValue;
        state.result = handler(state.value);
        return runGeneratorWithInnerState(generator, handler, step, state);
      });
    }

    if (state.result === brandedVoid) {
      state.result = handler(state.value as TYield);
    }
    if (isPromise(state.result)) {
      return (state.result as Promise<TYield>).then((unboundResult) => {
        state.result = unboundResult;
        return runGeneratorWithInnerState(generator, handler, step, state);
      });
    }

    step = generator.next(state.result as never);
    state.value = step.value;
    state.result = brandedVoid;
  }
  return step.value;
}

export function run<TReturn, TYield, const TArgs extends any[]>(
  saga: (...args: TArgs) => Generator<TYield, TReturn, never>,
  handler: (effect: TYield) => never,
  ...args: TArgs
): TReturn | Promise<TReturn> {
  const generator = saga(...args);
  const step = generator.next();

  return runGeneratorWithInnerState(generator as Generator<TYield, TReturn, never>, handler, step, {
    result: brandedVoid,
    value: step.value,
  });
}
