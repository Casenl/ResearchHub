/**
 * Firebase Admin SDK — server-side only.
 * Only import from Cloud Functions, MCP server, or scripts. Never from client components.
 */

import type { App as AdminApp } from 'firebase-admin/app';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Storage as AdminStorage } from 'firebase-admin/storage';

let _adminApp: AdminApp | undefined;
let _adminDb: AdminFirestore | undefined;
let _adminStorage: AdminStorage | undefined;

/** Firebase Admin App instance. Uses service account from FIREBASE_ADMIN_SDK_PATH or Application Default Credentials. */
export function getAdminApp(): AdminApp {
  if (!_adminApp) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin');
    const apps = admin.getApps();
    if (apps.length > 0) {
      _adminApp = apps[0];
    } else {
      const keyPath = process.env.FIREBASE_ADMIN_SDK_PATH;
      if (keyPath) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require(keyPath);
        _adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
        });
      } else {
        _adminApp = admin.initializeApp();
      }
    }
  }
  return _adminApp!;
}

/** Admin Firestore instance. Only use server-side. */
export function getAdminFirestore(): AdminFirestore {
  if (!_adminDb) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getFirestore: getAdminFs } = require('firebase-admin/firestore');
    _adminDb = getAdminFs(getAdminApp());
  }
  return _adminDb!;
}

/** Admin Storage instance. Only use server-side. */
export function getAdminStorage(): AdminStorage {
  if (!_adminStorage) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getStorage: getAdminSt } = require('firebase-admin/storage');
    _adminStorage = getAdminSt(getAdminApp());
  }
  return _adminStorage!;
}
