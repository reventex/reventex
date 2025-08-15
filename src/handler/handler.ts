import { callHandler } from '../effects/call';
import { ICoreEffectName, type IEffect } from '../types';

export const handler = (effect: IEffect<ICoreEffectName, [(...args: any[]) => any, any[]]>): any => {
  switch (effect.name) {
    case ICoreEffectName.CALL:
      return callHandler(effect);
  }
};
