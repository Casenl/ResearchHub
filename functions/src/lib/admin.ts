import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | undefined;

/** Get (or initialize) the Firebase Admin app for Cloud Functions. */
function getAdminApp(): App {
  if (!app) {
    const existing = getApps();
    app = existing.length > 0 ? existing[0] : initializeApp();
  }
  return app;
}

/** Get the Firestore instance. */
export function db(): Firestore {
  return getFirestore(getAdminApp());
}

/** Get the Storage instance. */
export function storage(): Storage {
  return getStorage(getAdminApp());
}
