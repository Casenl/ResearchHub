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

/**
 * Derive the user role from custom claims or fall back to a default.
 * In production you'd set custom claims via Firebase Admin SDK or
 * Cloud Functions. For now, we default to "researcher" and treat the
 * first user (or a specific email domain) as admin.
 */
function deriveRole(firebaseUser: FirebaseUser): UserRole {
  // TODO: Read from Firestore users collection or custom claims
  // For MVP: emails ending with @itq.nl get admin, others get researcher
  const email = firebaseUser.email ?? "";
  if (email.endsWith("@itq.nl")) return "admin";
  return "researcher";
}

function toAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: deriveRole(firebaseUser),
  };
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      setFirebaseUser(fbUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const user = firebaseUser ? toAuthUser(firebaseUser) : null;
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
