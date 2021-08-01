import { domain } from '../../../common';
import todos from './projections/todos';
import users from './projections/users';
import getAllTodos from './resolvers/getAllTodos';
import getTodoById from './resolvers/getTodoById';
import events from './events';

export default domain(events).projections([todos, users]).resolvers([getAllTodos, getTodoById]);
