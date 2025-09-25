module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Add more lenient rules for development
    'vue/no-unused-components': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    // Disable multi-word component names rule
    'vue/multi-word-component-names': 'off',
    // Allow any in TypeScript
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow empty interfaces
    '@typescript-eslint/no-empty-interface': 'off'
  }
}
