export type IEffect<TName extends string = string, TArgs extends any[] = any[]> = { name: TName; args: TArgs };

export enum ICoreEffectName {
  CALL = '@reventex/CALL',
}

export type ISaga<TReturn = any> = Generator<IEffect, TReturn, never>;
