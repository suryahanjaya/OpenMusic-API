import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // Main configuration
  {
    files: ['**/*.js', '**/*.mjs'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // AirBnB-inspired rules

      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-shadow': 'error',

      // ES6+
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',

      // Style
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],

      // Import rules
      'import/no-unresolved': 'off', // Turn off for CommonJS
      'import/order': ['error', {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      }],
    },
  },

  // Migration files special rules
  {
    files: ['migrations/**/*.js'],
    rules: {
      'camelcase': 'off', // Allow snake_case in migrations
      'no-console': 'off',
    },
  },

  // Test files special rules (when we add them)
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
