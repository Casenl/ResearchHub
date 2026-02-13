import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/lib/services/__tests__/integration/**/*.integration.test.ts'],
    globalSetup: [
      './src/lib/services/__tests__/integration/setup.ts',
      './src/lib/services/__tests__/integration/teardown.ts',
    ],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
