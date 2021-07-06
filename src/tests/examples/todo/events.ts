import { t, events } from '../../../server';

export default events('events', ['todos', 'users'])
  .define('TODO_ADDED', t.type({ text: t.string }))
  .define('TODO_TOGGLED', t.void)
  .define('TODO_DELETED', t.void)
  .define('USER_CREATED', t.type({ username: t.string }))
  .define('USER_DELETED', t.void);
