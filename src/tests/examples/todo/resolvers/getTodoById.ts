import { t, resolver } from '../../../../server';

export default resolver('getTodoById')
  .withArgs(t.string)
  .returns(
    t.union([
      t.type({
        todoId: t.string,
        ownerId: t.string,
        text: t.string,
        checked: t.boolean,
      }),
      t.null,
    ])
  )
  .implements(async ({ database, session, objectId }, todoId) => {
    const document = await database
      .collection('todos')
      .findOne(
        { _id: objectId(todoId) },
        { session, projection: { _id: 1, todoId: 1, ownerId: 1, text: 1, checked: 1 } }
      );

    if (document == null) {
      return null;
    }

    const todo: {
      todoId: string;
      ownerId: string;
      text: string;
      checked: boolean;
    } = {
      todoId: document._id.toString(),
      ownerId: document.ownerId,
      text: document.text,
      checked: document.checked,
    };

    return todo;
  });
