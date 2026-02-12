"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { subscribeUserById, upsertUser } from "@/lib/firestore/users";
import { getAppSettings } from "@/lib/firestore/settings";
import type { UserRole } from "@/types";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

interface AuthContextValue {
  /** The currently authenticated user, null if not logged in. */
  user: AuthUser | null;
  /** The raw Firebase user object. */
  firebaseUser: FirebaseUser | null;
  /** Whether the auth state is still loading. */
  isLoading: boolean;
  /** Whether the current user has the admin role. */
  isAdmin: boolean;
  /** Whether the current user has the researcher role. */
  isResearcher: boolean;
  /** Whether the current user has the viewer role. */
  isViewer: boolean;
  /** The current user's role. */
  role: UserRole;
  /** Auth-level error (e.g. sign-in failure surfaced to the provider). */
  authError: string | null;
  /** Sign in with email and password. */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Create account with email and password. */
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  /** Sign in with Google popup. */
  signInWithGoogle: () => Promise<void>;
  /** Sign out the current user. */
  signOut: () => Promise<void>;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const googleProvider = new GoogleAuthProvider();

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firestoreRole, setFirestoreRole] = useState<UserRole | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError] = useState<string | null>(null);

  // 1. Listen for Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        setFirestoreRole(null);
      }
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // 2. When we have a Firebase user, subscribe to their Firestore user doc
  //    for the role. Auto-create the doc on first login.
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeUserById(
      firebaseUser.uid,
      async (userDoc) => {
        if (userDoc) {
          setFirestoreRole(userDoc.role);
        } else {
          // First login — create user doc with default role from app settings
          let defaultRole: UserRole = "researcher";
          try {
            const settings = await getAppSettings();
            defaultRole = settings.default_role;
          } catch {
            // Settings not available — fall back to researcher
          }

          await upsertUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName ?? "",
            email: firebaseUser.email ?? "",
            role: defaultRole,
            domain_ids: [],
          });
          // The subscription will fire again with the new doc
        }
      },
      (err) => {
        console.error("Error subscribing to user doc:", err);
        // Fall back to viewer on error so the app doesn't break
        setFirestoreRole("viewer");
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  // Loading until both auth state and Firestore role are resolved
  const isLoading = !isAuthReady || (firebaseUser !== null && firestoreRole === null);

  const user: AuthUser | null =
    firebaseUser && firestoreRole
      ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: firestoreRole,
        }
      : null;

  const role = user?.role ?? "viewer";

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password
      );
      await updateProfile(credential.user, { displayName });
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(getFirebaseAuth(), googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const value: AuthContextValue = {
    user,
    firebaseUser,
    isLoading,
    role,
    isAdmin: role === "admin",
    isResearcher: role === "researcher",
    isViewer: role === "viewer",
    authError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

/**
 * Access the current authentication state.
 * Must be used within an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
