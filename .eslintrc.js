module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn', // 未使用变量警告
    'no-debugger': 'warn',
    'vue/multi-word-component-names': 'off', // 禁用vue文件强制多个单词命名
    '@typescript-eslint/no-explicit-any': ['off'], //允许使用any
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowedNames: ['that'] // this可用的局部变量名称
      }
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': false
        }
      }
    ],
    '@typescript-eslint/ban-ts-comment': 'off', //允许使用@ts-ignore
    '@typescript-eslint/no-non-null-assertion': 'off' //允许使用非空断言
    // "vue/setup-compiler-macros": true
  }
};
