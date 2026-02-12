import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/integration/**/*.integration.test.ts'],
    globalSetup: [
      './__tests__/integration/setup.ts',
      './__tests__/integration/teardown.ts',
    ],
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
