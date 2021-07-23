module.exports = {
  extends: [
    "eslint:recommended",
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ["@typescript-eslint"],
  env: {
    browser: true
  },
  parserOptions: {
    project: ['./src/tsconfig.json', './src/matcher/tsconfig.json'],
    tsconfigRootDir: './',
    createDefaultProgram: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    "@typescript-eslint/no-non-null-assertion": 'off',
    "@typescript-eslint/explicit-module-boundary-types": 'off',
    '@typescript-eslint/camelcase': 'off',
    'no-constant-condition': 'off',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    '@typescript-eslint/prefer-regexp-exec': 'off',
  },
}