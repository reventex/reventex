import { ImmutableContext, TStrictKey } from '../types';

export function getIn(context: ImmutableContext, key: TStrictKey) {
  const lastIndex = key.length;

  let pointer = context.state;

  for (let index = 0; index < lastIndex; index++) {
    const pointerKey: any = key[index];

    pointer = pointer[pointerKey];

    if (pointer === undefined) {
      return undefined;
    }
  }
  return pointer;
}
