module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    allowImportExportEverywhere: false,
  },
  env: {
    es6: true,
    jest: true,
    node: true,
  },
  plugins: ['prettier', 'jest'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'error',
    'no-warning-comments': [1, { terms: ['todo', 'fixme'], location: 'start' }],
  },
  overrides: [
    {
      files: ['*.test.js', '*.test.jsx'],
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'off',
        'jest/valid-expect': 'error',
      },
    },
  ],
};
