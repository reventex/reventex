import { MongoClient } from 'mongodb';

import { entityId, EntityId } from '../server';
import domain from './examples/todo/domain';

jest.setTimeout(120000);

const { REVENTEX_MONGO_CONNECTION_USERNAME, REVENTEX_MONGO_CONNECTION_PASSWORD } = process.env;

describe('examples:todo', () => {
  let app = domain;

  beforeAll(async () => {
    const databaseName = 'reventex';

    const mongoConnectionUrl = `mongodb+srv://${REVENTEX_MONGO_CONNECTION_USERNAME}:${REVENTEX_MONGO_CONNECTION_PASSWORD}@reventex.prjz8.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

    app = domain.connect(MongoClient.connect(mongoConnectionUrl));

    try {
      await app.drop({ eventStore: true });
    } catch {
      void 0;
    }

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('', () => {
    const userCount = 7;
    const todoCount = 11;

    const userIds: Array<EntityId<'users'>> = [];
    for (let userIndex = 0; userIndex < userCount; userIndex++) {
      userIds.push(entityId('users'));
    }

    const todos: Array<{
      userId: EntityId<'users'>;
      todoId: EntityId<'todos'>;
    }> = [];
    for (let todoIndex = 0; todoIndex < todoCount; todoIndex++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      if (userId == null) {
        throw new TypeError();
      }
      todos.push({
        userId,
        todoId: entityId('todos'),
      });
    }

    const toggles: Array<{
      todoId: EntityId<'todos'>;
      userId: EntityId<'users'>;
    }> = [];

    for (let userIndex = 0; userIndex < userCount; userIndex++) {
      for (let todoIndex = 0; todoIndex < todoCount; todoIndex++) {
        const todo = todos[Math.floor(Math.random() * todos.length)];
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        if (todo == null) {
          throw new TypeError();
        }
        if (userId == null) {
          throw new TypeError();
        }
        toggles.push({
          todoId: todo.todoId,
          userId,
        });
      }
    }

    test(`create users [${userIds.length}]`, async () => {
      for (const userId of userIds) {
        await app.publish({
          payload: {
            username: 'user-1',
            userId: userId,
          },
          type: 'USER_CREATED',
        });
        console.log(`User "${userId.documentId}" has been created`);
      }
    });

    test(`add todos [${todos.length}]`, async () => {
      for (const { todoId, userId } of todos) {
        const text = `User "${userId.documentId}" added the todo "${todoId.documentId}"`;
        await app.publish({
          payload: {
            text,
            todoId,
            userId,
          },
          type: 'TODO_ADDED',
        });
        console.log(text);
      }
    });

    test(`toggle todos [${toggles.length}]`, async () => {
      for (const { todoId, userId } of toggles) {
        await app.publish({
          payload: {
            todoId,
            userId,
          },
          type: 'TODO_TOGGLED',
        });
        console.log(`User "${userId.documentId}" toggled the todo "${todoId.documentId}"`);
      }
    });

    test('getAllTodos()', async () => {
      const result = await app.read('getAllTodos');
      console.log(result);
      expect(result.length).toEqual(todos.length);

      for (const { todoId, userId } of todos) {
        const item = result.find((item: any) => item.todoId === todoId.documentId);

        let checked = false;
        for (const toggle of toggles) {
          if (toggle.todoId.documentId === todoId.documentId) {
            checked = !checked;
            console.log(todoId.documentId, checked);
          }
        }

        expect(item).toMatchObject({
          todoId: todoId.documentId,
          ownerId: userId.documentId,
          checked,
        });
      }
    });

    for (const { todoId, userId } of todos) {
      test(`getTodoById("${todoId.documentId}")`, async () => {
        const result = await app.read('getTodoById', todoId.documentId);
        console.log(result);

        expect(result).toMatchObject({
          todoId: todoId.documentId,
          ownerId: userId.documentId,
        });
      });
    }
  });
});
