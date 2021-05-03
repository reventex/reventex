import { projection } from '../../../../common';
import events from '../events';

export default projection('todos', events)
  .on('TODO_ADDED', function* ({ event, api: { get } }) {
    console.log(event.payload.text);
    yield get('qqq');
  })
  .on('TODO_TOGGLED', function* ({ event, api: { get } }) {
    console.log(event);
    yield get('qqq');
  })
  .on('TODO_DELETED', function* ({ event, api: { get } }) {
    console.log(event);
    yield get('qqq');
  });
