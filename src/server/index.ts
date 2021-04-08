import * as t from 'io-ts'

import declareEvents from './declareEvents'
import declareProjection from './declareProjection'

const events = declareEvents()
  .event('create', { a: t.boolean })
  .event('drop', { a: t.boolean })
  .event('dispose', { a: t.boolean })

const users = declareProjection('users', events)
  .on('create', ()=>{})
  .on('drop', ()=>{})

const books = declareProjection('book', events)
  .on('create', ()=>{})
  .on('drop', ()=>{})

function* foo(event: {a:boolean}, api: {get:(key:string)=>string}) {
  yield api.get('sdfsdf')
  yield api.get('sdfsdf')
  yield api.get('sdfsdf')
  return undefined
}

type sdfsf = typeof foo
//

// f = (event: {     a: boolean; }, api: {     get: (key: string) => string; }) => Generator<string, undefined, unknown>


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
