import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.wrangler', 'design-export'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'worker/**/*.ts', 'scripts/**/*.{mjs,ts}'],
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': { typescript: { project: ['./tsconfig.app.json', './tsconfig.worker.json'] } },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Architecture boundaries (claude-code-prompt §Boundaries):
      //   /src/engine must not import from /src/cards
      //   /src/cards  must not import from /src/data  (cards receive props only)
      //   /src/cards  may import *types* from /src/engine/types only
      'import/no-restricted-paths': ['error', {
        basePath: './',
        zones: [
          { target: './src/engine', from: './src/cards', message: 'engine must not import cards' },
          { target: './src/cards', from: './src/data', message: 'cards receive props only — never import data' },
          { target: './src/cards', from: './src/engine', except: ['./types.ts', './format.ts'], message: 'cards may only import engine types' },
          { target: './src/engine', from: './src/screens', message: 'engine must not import screens' },
          { target: './src/data', from: './src/engine', except: ['./types.ts'], message: 'data may only import engine types' },
        ],
      }],
    },
  },
)
