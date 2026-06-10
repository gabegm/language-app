import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
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
      'react-refresh/only-export-components': 'warn',
      // Exhaustive deps: we intentionally omit some deps (e.g. challenge in DailyChallenge)
      'react-hooks/exhaustive-deps': 'warn',
      // Allow impure hooks (randomness in game logic)
      'react-hooks/purity': 'warn',
      // Data fetching / initialization in useEffect is intentional here
      'react-hooks/set-state-in-effect': 'warn',
      // Allow unused assignments in game logic
      'no-useless-assignment': 'warn',
    },
  },
])
