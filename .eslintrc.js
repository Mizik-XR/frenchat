module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
    'circular-dependencies'
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    // Règles React
    'react/jsx-uses-react': 'off', // Désactivée car nous utilisons ReactInstance
    'react/react-in-jsx-scope': 'off', // Désactivée car nous utilisons ReactInstance
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Règles d'import pour prévenir les dépendances circulaires
    'import/no-cycle': 'error',
    'circular-dependencies/no-cycles': 'error',
    
    // Forcer l'utilisation de ReactInstance
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            message: "Importez depuis '@/core/ReactInstance' pour éviter les problèmes d'instances multiples."
          }
        ]
      }
    ],
    
    // Règles pour l'utilisation de Supabase
    'no-restricted-exports': [
      'warn',
      {
        restrictedNamedExports: ['supabase'],
        message: "Préférez exporter et utiliser 'supabaseService' plutôt que d'exporter directement le client."
      }
    ],
    
    // Autres règles importantes
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    
    // Règles de formatage du code
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    
    // Règles d'ordre d'import
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external'],
          'internal',
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ]
  },
  overrides: [
    // Règles spécifiques aux tests
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-restricted-imports': 'off',
        'import/no-extraneous-dependencies': 'off'
      }
    },
    // Règles spécifiques au module de compatibilité
    {
      files: ['**/compatibility/**/*.[jt]s?(x)'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-restricted-exports': 'off'
      }
    }
  ]
}; 