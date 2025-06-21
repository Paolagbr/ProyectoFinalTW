module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {

    "quotes": ["error", "double"],
    "object-curly-spacing": ["error", "never"],
    "max-len": ["error", {
      "code": 120,
      "ignoreComments": true,
      "ignoreUrls": true,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true,
      "ignoreRegExpLiterals": true,
    }],
    "indent": ["error", 2, {"SwitchCase": 1}],
    "comma-dangle": ["error", "always-multiline"],
    "padded-blocks": ["error", "never"],
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
  },
};

