import { getApps, initializeApp, type FirebaseApp } from "firebase/app";

/** Firebase web SDK, configured from the JSON inlined at build time by next.config.ts. */
export function firebaseApp(): FirebaseApp {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_WEBAPP_CONFIG;
  if (!raw) {
    throw new Error("Firebase web config is missing. Set FIREBASE_WEBAPP_CONFIG at build time.");
  }
  return getApps()[0] ?? initializeApp(JSON.parse(raw));
}
