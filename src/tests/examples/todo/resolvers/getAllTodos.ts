import { t, resolver } from '../../../../server';

export default resolver('getAllUsers')
  .withArgs()
  .returns(t.array(t.string))
  .implements(async ({ database, session }) => {
    const documents = await database
      .collection('users')
      .find({}, { session, projection: { _id: 1 } })
      .toArray();

    const users: Array<string> = documents.map((document) => document._id);

    return users;
  });
