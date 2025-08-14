import eslint from '@eslint/js';
import tslint from 'typescript-eslint';

export default tslint.config(
  eslint.configs.recommended,
  tslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
  },
  {
    ignores: ['lib', '.idea', '.yarn', 'coverage', 'node_modules'],
  },
  {
    rules: {
      quotes: ['error', 'single'],
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
          flatTernaryExpressions: false,
          offsetTernaryExpressions: false,
          ignoreComments: false,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'require-yield': 'off',
    },
  },
);
