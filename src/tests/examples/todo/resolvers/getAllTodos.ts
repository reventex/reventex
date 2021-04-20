import { t, resolver } from '../../../../common';

export default resolver('getAllUsers')
  .withArgs()
  .returns(t.array(t.string))
  .implements(async () => {
    const users: Array<string> = [];
    return users;
  });
