import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
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

/** Required Firebase config fields — empty/missing values cause auth/argument-error. */
const REQUIRED_CONFIG_KEYS: (keyof FirebaseConfig)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

/**
 * Validate a Firebase config object. Returns an array of missing required field
 * names, or an empty array if the config is valid.
 */
export function validateFirebaseConfig(
  config: FirebaseConfig
): (keyof FirebaseConfig)[] {
  return REQUIRED_CONFIG_KEYS.filter((key) => !config[key]);
}

function getFirebaseConfig(): FirebaseConfig {
  const config: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
  };

  const missing = validateFirebaseConfig(config);
  if (missing.length > 0) {
    console.error(
      `[Firebase] Missing required config: ${missing.join(", ")}. ` +
        "Check your NEXT_PUBLIC_FIREBASE_* environment variables in .env.local."
    );
  }

  return config;
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

/** Firebase Auth instance. Only call from client-side code.
 *  Uses localStorage persistence so Playwright E2E tests can capture auth state
 *  via storageState (IndexedDB — the default — is not captured). */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    try {
      _auth = initializeAuth(getFirebaseApp(), {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch {
      // Already initialized elsewhere — fall back to existing instance
      _auth = getAuth(getFirebaseApp());
    }
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
