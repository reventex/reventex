import { projection } from '../../../../server';
import events from '../events';

export default projection('todos', events)
  .on(
    'TODO_ADDED',
    function* ({
      event: {
        payload: { userId, text },
      },
      api,
    }) {
      yield api.set({
        userId,
        text,
        checked: false,
      });
    }
  )
  .on('TODO_TOGGLED', function* ({ api }) {
    const checked = yield api.get('checked');
    yield api.set('checked', !checked);
  })
  .on('TODO_DELETED', function* ({ api }) {
    yield api.remove();
  });
