// =============================================================================
// ITQ Market Intelligence Portal — Firebase Configuration (Placeholder)
// =============================================================================
//
// This module will initialise and export the Firebase services used by the
// portal (Firestore, Storage, Auth). For the MVP everything is local-state
// only; the functions below are stubs that will be replaced once the Firebase
// project is provisioned.
//
// Required environment variables (.env.local):
// ─────────────────────────────────────────────
//   NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
//   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
//   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
//   NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** Shape of the Firebase configuration object. */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// -----------------------------------------------------------------------------
// Placeholder functions
// -----------------------------------------------------------------------------

/**
 * Initialise the Firebase app.
 *
 * TODO: Import `initializeApp` from "firebase/app", read env vars, and return
 * the initialised `FirebaseApp` instance.
 */
export function initFirebase(): null {
  // TODO: Implement Firebase initialisation
  // const config: FirebaseConfig = {
  //   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  //   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  //   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  //   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  //   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  //   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  // };
  // return initializeApp(config);
  return null;
}

/**
 * Get a Firestore database instance.
 *
 * TODO: Import `getFirestore` from "firebase/firestore" and return
 * the `Firestore` instance.
 */
export function getFirestoreDb(): null {
  // TODO: return getFirestore(initFirebase()!);
  return null;
}

/**
 * Get a Firebase Storage instance.
 *
 * TODO: Import `getStorage` from "firebase/storage" and return
 * the `FirebaseStorage` instance.
 */
export function getFirebaseStorage(): null {
  // TODO: return getStorage(initFirebase()!);
  return null;
}

/**
 * Get a Firebase Auth instance.
 *
 * TODO: Import `getAuth` from "firebase/auth" and return
 * the `Auth` instance.
 */
export function getFirebaseAuth(): null {
  // TODO: return getAuth(initFirebase()!);
  return null;
}
