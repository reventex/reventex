import * as t from "io-ts";

import declareEvents from "./declareEvents";
import declareProjection from "./declareProjection";

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
