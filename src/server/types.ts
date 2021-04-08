export type NarrowableString =
  | string
  | number
  | symbol

export type Narrowable =
  | string
  | number
  | boolean
  | symbol
  | object
  | undefined
  | void
  | null
  | {};

export type ValuesOfTuple<
  T extends ReadonlyArray<any>
  > = T extends ReadonlyArray<any> ? T[number] : never;

export type UnionOfTuple<T extends ReadonlyArray<any>> = T[number]

export type ExcludeFromTuple<T extends ReadonlyArray<any>, E> =
  T extends readonly [infer F, ...infer R] ? F extends E ? ExcludeFromTuple<R, E> :
    readonly [F, ...ExcludeFromTuple<R, E>] : readonly []
