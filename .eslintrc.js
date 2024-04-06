const { aria } = require('aria-query');

const ariaAttributes = Object.keys(aria);

module.exports = {
  extends: ['eslint:recommended'],
  plugins: ['@shopify', 'import'],
  env: {
    browser: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier',
        '@vue/eslint-config-typescript',
        'plugin:vue/vue3-essential'
      ]
    },
    {
      files: ['*.vue'],
      rules: {
        'import/no-default-export': 'off'
      }
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['prettier'],
      rules: {
        camelCase: [
          'error',
          {
            ignoreDestructuring: true,
            ignoreImports: true,
            ignoreGlobals: true
          }
        ]
      }
    }
  ],
  rules: {
    'no-var': 'error',
    'prefer-const': 'error',
    'no-use-before-define': ['error', { variables: false, functions: false }],
    'prefer-arrow-callback': 'error',
    '@shopify/prefer-early-return': ['warn', { maximumStatements: 2 }],
    eqeqeq: 'error',
    'prefer-template': 'error',
    'import/no-commonjs': 'warn',
    'import/no-default-export': 'warn'
  },
  ignorePatterns: ['node_modules', 'build', 'dist', 'coverage', '*.d.ts', '*.config.ts']
};
