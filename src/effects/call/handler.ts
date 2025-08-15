import { ICoreEffectName, type IEffect } from '../../types';

export function callHandler(effect: IEffect<ICoreEffectName.CALL, [(...args: any[]) => any, any[]]>) {
  const [fun, args] = effect.args;
  return fun(...args);
}
