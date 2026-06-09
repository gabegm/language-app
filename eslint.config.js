import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Custom hooks are exported alongside components — expected pattern
      'react-refresh/only-export-components': [
        'warn',
        { allowExport: '1', allowImport: '0', ignoreSourceModule: false },
      ],
      // Exhaustive deps: we intentionally omit some deps (e.g. challenge in DailyChallenge)
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
