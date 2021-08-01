import { projection } from '../../../../server';
import events from '../events';

export default projection('users', events)
  .on('USER_CREATED', function* ({ event, api }) {
    yield api.set({
      username: event.payload.username,
      createdAt: event.timestamp,
    });
  })
  .on('USER_DELETED', function* ({ api }) {
    yield api.remove();
  });
