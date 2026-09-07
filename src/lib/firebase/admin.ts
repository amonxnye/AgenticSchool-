import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK. On App Hosting `initializeApp()` picks up the backend's
 * service account and FIREBASE_CONFIG automatically. Locally, point
 * GOOGLE_APPLICATION_CREDENTIALS at a service-account key.
 */
function app(): App {
  return getApps()[0] ?? initializeApp();
}

export function adminAuth() {
  return getAuth(app());
}

let db: Firestore | undefined;

export function firestore(): Firestore {
  if (!db) {
    db = getFirestore(app());
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
}
