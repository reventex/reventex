import {Narrowable, ValuesOfTuple} from './types'

export default function declareProjection<
 Name extends Narrowable,
 EventTypes extends ReadonlyArray<Narrowable>,
 Projection extends {
   name: Name;
   handlers: Partial<Record<ValuesOfTuple<EventTypes>, boolean>>;
 }
> (projection: Projection): Projection {
  return projection
}

