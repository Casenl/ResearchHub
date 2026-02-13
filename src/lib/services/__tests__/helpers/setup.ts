import { vi } from 'vitest';

vi.mock('@/lib/firebase-admin', async () => {
  const mock = await import('./mock-admin');
  return {
    getAdminFirestore: mock.getAdminFirestore,
    getAdminStorage: mock.getAdminStorage,
  };
});
