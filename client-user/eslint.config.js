// client-user/eslint.config.js
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    // Archivos CommonJS (ej. metro.config.cjs) usan globals de Node.
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        require: 'readonly',
        module: 'writable',
      },
    },
  },
]);
