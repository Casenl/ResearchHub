/**
 * In-memory Firestore + Storage mock for testing MCP service layer.
 *
 * Adapted from functions/__tests__/helpers/mock-firestore.ts with added
 * support for sub-collection chaining (needed by source-service).
 */

const store = new Map<string, Map<string, Record<string, unknown>>>();
let idCounter = 0;

function collectionKey(parts: string[]): string {
  return parts.join('/');
}

function getCollection(key: string): Map<string, Record<string, unknown>> {
  if (!store.has(key)) store.set(key, new Map());
  return store.get(key)!;
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

export function resetStore(): void {
  store.clear();
  idCounter = 0;
}

export function seedCollection(
  name: string,
  docs: Record<string, Record<string, unknown>>,
): void {
  const col = getCollection(name);
  for (const [id, data] of Object.entries(docs)) {
    col.set(id, structuredClone(data));
  }
}

export function getDoc(
  collection: string,
  id: string,
): Record<string, unknown> | undefined {
  return getCollection(collection).get(id);
}

export function getAllDocs(
  collection: string,
): Array<{ id: string; data: Record<string, unknown> }> {
  return Array.from(getCollection(collection).entries()).map(([id, data]) => ({
    id,
    data,
  }));
}

// ---------------------------------------------------------------------------
// Mock Firestore implementation
// ---------------------------------------------------------------------------

class MockDocRef {
  constructor(
    private pathParts: string[],
    public id: string,
  ) {}

  private get collectionKey(): string {
    return collectionKey(this.pathParts);
  }

  collection(name: string): MockCollectionRef {
    return new MockCollectionRef([...this.pathParts, this.id, name]);
  }

  async get() {
    const col = getCollection(this.collectionKey);
    const data = col.get(this.id);
    return {
      exists: !!data,
      data: () => (data ? structuredClone(data) : undefined),
      id: this.id,
      ref: this,
    };
  }

  async update(updates: Record<string, unknown>) {
    const col = getCollection(this.collectionKey);
    const existing = col.get(this.id);
    if (existing) {
      Object.assign(existing, updates);
    }
  }
}

class MockQuery {
  private filters: Array<{ field: string; op: string; value: unknown }> = [];
  private _limit: number | null = null;

  constructor(private pathParts: string[]) {}

  private get collectionKey(): string {
    return collectionKey(this.pathParts);
  }

  private clone(): MockQuery {
    const q = new MockQuery(this.pathParts);
    q.filters = [...this.filters];
    q._limit = this._limit;
    return q;
  }

  where(field: string, op: string, value: unknown): MockQuery {
    const q = this.clone();
    q.filters.push({ field, op, value });
    return q;
  }

  limit(n: number): MockQuery {
    const q = this.clone();
    q._limit = n;
    return q;
  }

  orderBy(_field: string, _dir?: string): MockQuery {
    return this.clone();
  }

  async get() {
    const col = getCollection(this.collectionKey);
    let entries = Array.from(col.entries());

    for (const { field, op, value } of this.filters) {
      entries = entries.filter(([, data]) => {
        const fieldValue = data[field];
        switch (op) {
          case '==':
            return fieldValue === value;
          case '!=':
            return fieldValue !== value;
          case '>=':
            return String(fieldValue) >= String(value);
          case '<':
            return String(fieldValue) < String(value);
          default:
            return true;
        }
      });
    }

    if (this._limit !== null) entries = entries.slice(0, this._limit);

    const docs = entries.map(([id, data]) => ({
      id,
      data: () => structuredClone(data),
      exists: true,
      ref: new MockDocRef(this.pathParts, id),
    }));

    return { empty: docs.length === 0, docs };
  }
}

class MockCollectionRef {
  constructor(private pathParts: string[]) {}

  private get collectionKey(): string {
    return collectionKey(this.pathParts);
  }

  doc(id: string): MockDocRef {
    return new MockDocRef(this.pathParts, id);
  }

  async add(data: Record<string, unknown>): Promise<{ id: string }> {
    const col = getCollection(this.collectionKey);
    idCounter++;
    const id = `mock-id-${idCounter}`;
    col.set(id, structuredClone(data));
    return { id };
  }

  where(field: string, op: string, value: unknown): MockQuery {
    return new MockQuery(this.pathParts).where(field, op, value);
  }

  orderBy(field: string, dir?: string): MockQuery {
    return new MockQuery(this.pathParts).orderBy(field, dir);
  }

  async get() {
    return new MockQuery(this.pathParts).get();
  }
}

// ---------------------------------------------------------------------------
// Mock Storage
// ---------------------------------------------------------------------------

interface UploadedFile {
  path: string;
  data: Buffer;
  metadata: unknown;
}

const uploadedFiles: UploadedFile[] = [];

export function resetStorage(): void {
  uploadedFiles.length = 0;
}

export function getUploadedFiles(): UploadedFile[] {
  return uploadedFiles;
}

const mockBucket = {
  name: 'test-bucket',
  file: (path: string) => ({
    save: async (data: Buffer, options?: { metadata?: unknown }) => {
      uploadedFiles.push({ path, data, metadata: options?.metadata });
    },
    makePublic: async () => {},
  }),
};

// ---------------------------------------------------------------------------
// Exported mocks — replace getAdminFirestore() / getAdminStorage()
// ---------------------------------------------------------------------------

const mockFirestore = {
  collection: (name: string) => new MockCollectionRef([name]),
};

export function getAdminFirestore() {
  return mockFirestore as unknown as FirebaseFirestore.Firestore;
}

export function getAdminStorage(): { bucket: () => typeof mockBucket } {
  return { bucket: () => mockBucket };
}
