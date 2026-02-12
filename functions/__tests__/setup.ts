import { vi } from 'vitest';

vi.mock('../src/lib/admin', async () => {
  const mockFirestore = await import('./helpers/mock-firestore');
  const mockStorage = await import('./helpers/mock-storage');
  return { db: mockFirestore.db, storage: mockStorage.storage };
});
