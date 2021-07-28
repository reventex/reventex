import { t, events } from '../../../server';

export default events('events')
  .define(
    'TODO_ADDED',
    t.type({
      text: t.string,
      todoId: t.entityId('todos'),
      userId: t.entityId('users'),
    })
  )
  .define(
    'TODO_TOGGLED',
    t.type({
      todoId: t.entityId('todos'),
      userId: t.entityId('users'),
    })
  )
  .define(
    'TODO_DELETED',
    t.type({
      todoId: t.entityId('todos'),
      userId: t.entityId('users'),
    })
  )
  .define(
    'USER_CREATED',
    t.type({
      username: t.string,
      userId: t.entityId('users'),
    })
  )
  .define(
    'USER_DELETED',
    t.type({
      userId: t.entityId('users'),
    })
  );
