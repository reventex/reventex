import { projection } from '../../../common';
import events from '../events';

export default projection('todos', events)
  .on('TODO_ADDED', function* (event, { get }) {
    console.log(event.payload.text);
    type dsfdds = typeof event;
    yield get('qqq');
  })
  .on('TODO_TOGGLED', function* (event, { get }) {
    console.log(event);
    type dsfsdf = typeof event.payload;
    yield get('qqq');
  })
  .on('TODO_DELETED', function* (event, { get }) {
    console.log(event);
    type dsfsdf = typeof event.payload;
    yield get('qqq');
  });
