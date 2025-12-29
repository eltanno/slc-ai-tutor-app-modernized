module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'import',
    'unused-imports',
  ],
  rules: {
    // Enforce strict code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',

    // Import rules
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
    }],
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',

    // Unused imports/variables
    'no-unused-vars': 'off', // Turned off in favor of unused-imports
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // Code quality
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'quote-props': ['error', 'as-needed'],

    // Naming conventions
    camelcase: ['error', {
      properties: 'never',
      ignoreDestructuring: false,
    }],

    // Complexity
    'max-lines': ['warn', {
      max: 500,
      skipBlankLines: true,
      skipComments: true,
    }],
    'max-lines-per-function': ['warn', {
      max: 100,
      skipBlankLines: true,
      skipComments: true,
    }],
    complexity: ['warn', 15],

    // Formatting (will be handled by prettier if added)
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'always'],
    'max-len': ['error', {
      code: 100,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    }],
  },
  overrides: [
    // TypeScript files
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: [
        '@typescript-eslint',
        'import',
        'unused-imports',
      ],
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': 'off', // Use unused-imports instead
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-misused-promises': 'error',

        // Import rules for TypeScript
        'import/extensions': ['error', 'ignorePackages', {
          ts: 'never',
          tsx: 'never',
        }],
      },
    },
    // Test files
    {
      files: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts'],
      env: {
        jest: true,
        mocha: true,
      },
      rules: {
        'max-lines-per-function': 'off',
        'no-magic-numbers': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'venv/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    'tmp/',
  ],
};
