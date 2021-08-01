import { t, resolver } from '../../../../server';

export default resolver('getAllTodos')
  .withArgs()
  .returns(
    t.array(
      t.type({
        todoId: t.string,
        ownerId: t.string,
        text: t.string,
        checked: t.boolean,
      })
    )
  )
  .implements(async ({ database, session }) => {
    const documents = await database
      .collection('todos')
      .find({}, { session, projection: { _id: 1, todoId: 1, ownerId: 1, text: 1, checked: 1 } })
      .toArray();

    const todos: Array<{
      todoId: string;
      ownerId: string;
      text: string;
      checked: boolean;
    }> = documents.map(({ _id, ownerId, text, checked }) => ({
      todoId: _id.toString(),
      ownerId,
      text,
      checked,
    }));

    return todos;
  });
