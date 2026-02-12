/**
 * In-memory Firestore mock for testing Cloud Functions routes.
 *
 * Provides a Map-based store with collection/doc/query chaining that matches
 * the subset of the Firestore Admin SDK used by the route handlers.
 */

const store = new Map<string, Map<string, Record<string, unknown>>>();
let idCounter = 0;

function getCollection(name: string): Map<string, Record<string, unknown>> {
  if (!store.has(name)) store.set(name, new Map());
  return store.get(name)!;
}

// ---------------------------------------------------------------------------
// Test helpers — exported for use in test files
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
    private collectionName: string,
    public id: string,
  ) {}

  async get() {
    const col = getCollection(this.collectionName);
    const data = col.get(this.id);
    return {
      exists: !!data,
      data: () => (data ? structuredClone(data) : undefined),
      id: this.id,
      ref: this,
    };
  }

  async update(updates: Record<string, unknown>) {
    const col = getCollection(this.collectionName);
    const existing = col.get(this.id);
    if (existing) {
      Object.assign(existing, updates);
    }
  }
}

class MockQuery {
  private filters: Array<{ field: string; op: string; value: unknown }> = [];
  private _limit: number | null = null;

  constructor(private collectionName: string) {}

  private clone(): MockQuery {
    const q = new MockQuery(this.collectionName);
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
    const col = getCollection(this.collectionName);
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
      ref: new MockDocRef(this.collectionName, id),
    }));

    return { empty: docs.length === 0, docs };
  }
}

class MockCollectionRef {
  constructor(private name: string) {}

  doc(id: string): MockDocRef {
    return new MockDocRef(this.name, id);
  }

  async add(data: Record<string, unknown>): Promise<{ id: string }> {
    const col = getCollection(this.name);
    idCounter++;
    const id = `mock-id-${idCounter}`;
    col.set(id, structuredClone(data));
    return { id };
  }

  where(field: string, op: string, value: unknown): MockQuery {
    return new MockQuery(this.name).where(field, op, value);
  }

  orderBy(field: string, dir?: string): MockQuery {
    return new MockQuery(this.name).orderBy(field, dir);
  }

  /** Return all documents — used when query has no filters/orderBy. */
  async get() {
    return new MockQuery(this.name).get();
  }
}

// ---------------------------------------------------------------------------
// Exported mock — replaces `db()` from `lib/admin`
// ---------------------------------------------------------------------------

const mockFirestore = {
  collection: (name: string) => new MockCollectionRef(name),
};

export function db() {
  return mockFirestore;
}
