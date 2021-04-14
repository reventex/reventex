import { t, events } from '../../common';

export default events()
  .define('TODO_ADDED', t.type({ text: t.string }))
  .define('TODO_TOGGLED', t.void)
  .define('TODO_DELETED', t.void);
