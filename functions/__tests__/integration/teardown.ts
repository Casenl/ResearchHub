/**
 * Global teardown for integration tests.
 *
 * Deletes all test data created during the run (identified by TEST_PREFIX)
 * and removes seeded API keys.
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
  // Firestore doesn't support "starts with", so we use range query
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
  console.log('[integration teardown] Cleaning up test data...');

  let state;
  try {
    state = readTestState();
  } catch {
    console.log('[integration teardown] No test state file — skipping cleanup.');
    return;
  }

  const credentials = getServiceAccountCredentials();

  for (const app of getApps()) {
    await deleteApp(app);
  }

  const app = initializeApp(
    { credential: cert(credentials as Parameters<typeof cert>[0]) },
    'integration-test-teardown',
  );

  const db = getFirestore(app);
  const storage = getStorage(app);

  // Delete seeded API keys
  const keyIds = [state.adminKeyId, state.readWriteKeyId, state.readKeyId];
  for (const id of keyIds) {
    await db.collection('api-keys').doc(id).delete().catch(() => {});
  }
  console.log(`[integration teardown] Deleted ${keyIds.length} seeded API keys`);

  // Delete test research documents (by title prefix)
  const researchDeleted = await deleteMatchingDocs(db, 'research', 'title');
  console.log(`[integration teardown] Deleted ${researchDeleted} research docs`);

  // Delete test file attachments
  const filesDeleted = await deleteMatchingDocs(db, 'file-attachments', 'research_id');
  console.log(`[integration teardown] Deleted ${filesDeleted} file attachment docs`);

  // Also delete the seeded research by explicit ID
  await db.collection('research').doc(state.researchId).delete().catch(() => {});

  // Delete any API keys created during tests
  const testKeysDeleted = await deleteMatchingDocs(db, 'api-keys', 'name');
  console.log(`[integration teardown] Deleted ${testKeysDeleted} test-created API keys`);

  // Delete test audit logs
  // Audit logs are write-only with no admin SDK restriction, so clean them
  const auditSnapshot = await db
    .collection('audit_logs')
    .where('actor.user_id', '==', 'integration-test')
    .get();
  const auditBatch = db.batch();
  auditSnapshot.docs.forEach((doc) => auditBatch.delete(doc.ref));
  if (!auditSnapshot.empty) await auditBatch.commit();
  console.log(`[integration teardown] Deleted ${auditSnapshot.size} audit logs`);

  // Clean up Storage files for the seeded research
  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: `research/${state.researchId}/` });
    for (const file of files) {
      await file.delete().catch(() => {});
    }
    console.log(`[integration teardown] Deleted ${files.length} storage files`);
  } catch {
    console.log('[integration teardown] Storage cleanup skipped (bucket may not exist)');
  }

  // Remove the state file
  cleanTestState();

  await deleteApp(app);

  console.log('[integration teardown] Done.');
}
