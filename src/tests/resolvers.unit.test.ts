import { t, recordOfResolvers, resolver } from '../../src/server';

test('resolvers should work correctly', () => {
  const findOne = resolver('findOne')
    .withArgs(t.type({ text: t.string }))
    .returns(t.type({ result: t.type({ id: t.string, text: t.string }) }))
    .implements(async (api, { text }) => {
      return {
        result: {
          id: `id-${text}`,
          text,
        },
      };
    });

  const sum = resolver('sum')
    .withArgs(t.number, t.number)
    .returns(t.number)
    .implements(async (api, a, b) => {
      return a + b;
    });

  const resolvers = recordOfResolvers([findOne, sum]);

  const f1: typeof findOne = resolvers.findOne;
  const f2: typeof sum = resolvers.sum;

  expect(findOne).toEqual(f1);
  expect(sum).toEqual(f2);
});
