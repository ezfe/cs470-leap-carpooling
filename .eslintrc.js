module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    "sourceType": "module"
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    // Can we configure this to no delimeter?
    "@typescript-eslint/member-delimiter-style": "off"
  }
};