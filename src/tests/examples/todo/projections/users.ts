import { projection } from '../../../../common';
import events from '../events';

export default projection('users', events)
  .on('USER_CREATED', function* ({ event, api: { get } }) {
    console.log(event.payload);
    yield get('qqq');
  })
  .on('USER_DELETED', function* ({ event, api: { get } }) {
    console.log(event);
    yield get('qqq');
  });
