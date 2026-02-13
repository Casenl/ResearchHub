import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['functions/**', 'node_modules/**', '**/integration/**'],
    setupFiles: ['./src/lib/services/__tests__/helpers/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
