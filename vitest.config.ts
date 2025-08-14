export default async () => {
  const { defineConfig } = await import('vitest/config');

  return defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['json', 'html', 'lcov'],
        exclude: [
          'coverage',
          'scripts',
          'typings',
          '**/lib',
          '**/bin',
          '.yarn',
        ],
      },
      passWithNoTests: true,
      watch: false,
      testTimeout: 15000,
    },
  });
};
