import { ICoreEffectName, type IEffect } from '../../types';

export function* call<TFunction extends (...args: any[]) => any>(
  fun: TFunction,
  ...args: Parameters<TFunction>
): Generator<IEffect<ICoreEffectName.CALL, [TFunction, Parameters<TFunction>]>, Awaited<ReturnType<TFunction>>, any> {
  return yield {
    name: ICoreEffectName.CALL,
    args: [fun, args] as const,
  };
}
