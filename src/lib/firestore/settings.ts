/**
 * Firestore service for App Settings (app-settings/global).
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

import type { AppSettings } from "@/types";

const COLLECTION = "app-settings";
const DOC_ID = "global";

const DEFAULT_SETTINGS: AppSettings = {
  registrations_enabled: true,
  auto_register_domains: ["itq.eu"],
  default_role: "researcher",
};

// -----------------------------------------------------------------------------
// Read
// -----------------------------------------------------------------------------

export async function getAppSettings(): Promise<AppSettings> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, DOC_ID);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return DEFAULT_SETTINGS;

  const data = snapshot.data();
  return {
    registrations_enabled: data.registrations_enabled ?? DEFAULT_SETTINGS.registrations_enabled,
    auto_register_domains: data.auto_register_domains ?? DEFAULT_SETTINGS.auto_register_domains,
    default_role: data.default_role ?? DEFAULT_SETTINGS.default_role,
  };
}

export function subscribeAppSettings(
  onData: (settings: AppSettings) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, DOC_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(DEFAULT_SETTINGS);
        return;
      }
      const data = snapshot.data();
      onData({
        registrations_enabled: data.registrations_enabled ?? DEFAULT_SETTINGS.registrations_enabled,
        auto_register_domains: data.auto_register_domains ?? DEFAULT_SETTINGS.auto_register_domains,
        default_role: data.default_role ?? DEFAULT_SETTINGS.default_role,
      });
    },
    (err) => {
      console.error("Error subscribing to app settings:", err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Write
// -----------------------------------------------------------------------------

export async function updateAppSettings(
  settings: Partial<AppSettings>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, DOC_ID);
  await setDoc(docRef, settings, { merge: true });
}
