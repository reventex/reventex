import * as t from "io-ts";

import declareEvents from "./declareEvents";
import declareProjection from "./declareProjection";
import { NarrowableString, TypesOf } from "./types";

const events = declareEvents()
  .event("create", { a: t.boolean })
  .event("drop", { b: t.boolean })
  .event("dispose", { a: t.boolean });

const users = declareProjection("users", events)
  .on("create", function* (event, { get }) {
    const a: boolean = event.payload.a;
    yield get("ddd");
  })
  .on("drop", function* (event, { get }) {
    const a: boolean = event.payload.b;
    yield get("ddd");
  });

const books = declareProjection("book", events)
  .on("create", function* (event, { get }) {
    const a: boolean = event.payload.a;
    yield get("ddd");
  })
  .on("drop", function* (event, { get }) {
    const a: boolean = event.payload.b;
    yield get("ddd");
  });

function declareResolver<ResolverName extends NarrowableString>(
  name: ResolverName
) {
  function withArgs<Args extends ReadonlyArray<t.Type<any>>>(
    ...inputSchemas: Args
  ) {
    function returns<Result extends t.Type<any>>(outputSchema: Result) {
      function _implements(
        implementation: (...args: TypesOf<Args>) => Promise<t.TypeOf<Result>>
      ) {
        return implementation;
      }
      return {
        implements: _implements,
      };
    }
    return {
      returns,
    };
  }
  return {
    withArgs,
  };
}

const getAllUsers = declareResolver("getAllUsers")
  .withArgs(t.type({}), t.void)
  .returns(t.type({ users: t.array(t.string) }))
  .implements(async (a, b) => {
    const users: Array<string> = [];
    return { users };
  });

// const getAllUsers = declareResolver('getAllUsers', t.any, t.array(t.type({ userId: t.string })))
//
// const domain = declareDomain()
//   .database('database')
//   .eventStore('events')
//   .events(events)
//   .projection(users)
//   .projection(books)
//   .resolver(getAllUsers)
//   .resolver(getUserById)
//
