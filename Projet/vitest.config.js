// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,         // Permet d'utiliser directement 'test' et 'expect' sans les importer
  },
});
