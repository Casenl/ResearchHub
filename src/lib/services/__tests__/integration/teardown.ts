/**
 * Global teardown for MCP service integration tests.
 * Deletes all test data created during the run.
 */

import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import {
  getServiceAccountCredentials,
  readTestState,
  cleanTestState,
  TEST_PREFIX,
} from './helpers';

async function deleteMatchingDocs(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  fieldPath: string,
): Promise<number> {
  const snapshot = await db
    .collection(collectionName)
    .where(fieldPath, '>=', TEST_PREFIX)
    .where(fieldPath, '<', TEST_PREFIX + '\uffff')
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  if (!snapshot.empty) await batch.commit();
  return snapshot.size;
}

export async function teardown(): Promise<void> {
  console.log('[mcp-integration teardown] Cleaning up test data...');

  let state;
  try {
    state = readTestState();
  } catch {
    console.log('[mcp-integration teardown] No test state file -- skipping cleanup.');
    return;
  }

  const credentials = getServiceAccountCredentials();

  for (const app of getApps()) {
    await deleteApp(app);
  }

  const app = initializeApp(
    { credential: cert(credentials as Parameters<typeof cert>[0]) },
    'mcp-integration-teardown',
  );

  const db = getFirestore(app);
  const storage = getStorage(app);

  // Delete the seeded research by ID
  await db.collection('research').doc(state.researchId).delete().catch(() => {});

  // Delete research created during tests (by title prefix)
  const researchDeleted = await deleteMatchingDocs(db, 'research', 'title');
  console.log(`[mcp-integration teardown] Deleted ${researchDeleted} research docs`);

  // Delete test file attachments
  const filesDeleted = await deleteMatchingDocs(db, 'file-attachments', 'research_id');
  console.log(`[mcp-integration teardown] Deleted ${filesDeleted} file attachment docs`);

  // Delete audit logs from integration tests
  const auditSnapshot = await db
    .collection('audit_logs')
    .where('actor.user_id', '==', 'mcp-integration-test')
    .get();
  const auditBatch = db.batch();
  auditSnapshot.docs.forEach((doc) => auditBatch.delete(doc.ref));
  if (!auditSnapshot.empty) await auditBatch.commit();
  console.log(`[mcp-integration teardown] Deleted ${auditSnapshot.size} audit logs`);

  // Clean up Storage files for the seeded research
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: `research/${state.researchId}/` });
    for (const file of files) {
      await file.delete().catch(() => {});
    }
    console.log(`[mcp-integration teardown] Deleted ${files.length} storage files`);
  } catch {
    console.log('[mcp-integration teardown] Storage cleanup skipped');
  }

  cleanTestState();
  await deleteApp(app);
  console.log('[mcp-integration teardown] Done.');
}
