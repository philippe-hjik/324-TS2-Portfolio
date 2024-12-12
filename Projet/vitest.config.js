// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Utilise jsdom pour simuler un environnement DOM si nécessaire
    globals: true,         // Permet d'utiliser directement 'test' et 'expect' sans les importer
  },
});
