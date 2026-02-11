import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Analytics } from "firebase/analytics";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  };
}

// -----------------------------------------------------------------------------
// Lazy singleton instances — only initialize on the client
// -----------------------------------------------------------------------------

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _analytics: Analytics | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app =
      getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  }
  return _app;
}

/** Firebase Auth instance. Only call from client-side code. */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

/**
 * Firebase Analytics instance. Only call from client-side code.
 * Returns null if analytics is not supported (e.g. during SSR or in
 * environments without cookies/localStorage).
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (_analytics) return _analytics;
  const isAnalyticsSupported = await isSupported();
  if (!isAnalyticsSupported) return null;
  _analytics = getAnalytics(getFirebaseApp());
  return _analytics;
}

/** Firestore instance. Only call from client-side code. */
export function getFirestoreDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

/** Firebase Storage instance. Only call from client-side code. */
export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }
  return _storage;
}

// Server-side Firebase Admin SDK is in a separate file:
// import { getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin';
// Only import firebase-admin.ts from server-side code (services, MCP, scripts).
