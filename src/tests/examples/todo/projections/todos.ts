import { projection } from '../../../../server';
import events from '../events';

export default projection('todos', events)
  .on(
    'TODO_ADDED',
    function* ({
      event: {
        timestamp,
        payload: { userId, text },
      },
      api,
    }) {
      yield api.set({
        ownerId: userId,
        createdAt: timestamp,
        text,
        checked: false,
      });
    }
  )
  .on('TODO_TOGGLED', function* ({ api }) {
    const checked = yield api.get('checked');
    console.log(checked, typeof checked)
    console.log(yield api.get())
    yield api.set('checked', !checked);
  })
  .on('TODO_DELETED', function* ({ api }) {
    yield api.remove();
  });
