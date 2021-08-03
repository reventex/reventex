export type UnionOfTuple<T extends ReadonlyArray<any> | [any]> = T[number];

export type ExcludeFromTuple<T extends ReadonlyArray<any>, E> = T extends readonly [infer F, ...infer R]
  ? F extends E
    ? ExcludeFromTuple<R, E>
    : readonly [F, ...ExcludeFromTuple<R, E>]
  : readonly [];

export type RecordByUnion<Union extends string, U extends Record<Union, any>> = U;

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type LastOfUnion<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;
type PushToTuple<T extends any[], V> = [...T, V];

export type RecordFromEntries<A extends ReadonlyArray<readonly [PropertyKey, any] | [PropertyKey, any]>> = {
  [K in A[number][0]]: Extract<A[number], readonly [K, any]>[1];
};

export type TuplifyUnion<T, L = LastOfUnion<T>, N = [T] extends [never] ? true : false> = true extends N
  ? []
  : PushToTuple<TuplifyUnion<Exclude<T, L>>, L>;
