import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp } from 'firebase-admin/app';

if (getApps().length === 0) initializeApp();

/**
 * Sync Firestore user role to Firebase Auth custom claims.
 *
 * Triggered whenever a document in users/{uid} is created or updated.
 * Sets `request.auth.token.role` so Storage rules (which can't read
 * Firestore) can check the user's role.
 */
export const syncRoleClaims = onDocumentWritten(
  {
    document: 'users/{uid}',
    region: 'europe-west1',
  },
  async (event) => {
    const uid = event.params.uid;
    const after = event.data?.after?.data();

    if (!after) {
      // Document was deleted — clear custom claims
      await getAuth().setCustomUserClaims(uid, {});
      return;
    }

    const role = after.role as string | undefined;
    if (!role) return;

    // Only update if the role actually changed
    const before = event.data?.before?.data();
    if (before?.role === role) return;

    await getAuth().setCustomUserClaims(uid, { role });
  },
);
