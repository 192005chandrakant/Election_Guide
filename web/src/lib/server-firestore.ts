/**
 * Server-side Firestore access using the Firebase CLIENT SDK.
 * This is safe for Next.js API routes that run in the Node.js runtime.
 * For Admin SDK access (bypassing security rules), use firebase-admin separately.
 */
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      "Missing required Firebase environment variables. Check NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, and APP_ID."
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId,
  };
}

function getServerFirebaseApp(): FirebaseApp {
  if (appInstance) {
    return appInstance;
  }

  if (getApps().length > 0) {
    appInstance = getApp();
    return appInstance;
  }

  appInstance = initializeApp(getFirebaseConfig());
  return appInstance;
}

export function getServerFirestore(): Firestore {
  if (dbInstance) {
    return dbInstance;
  }

  const app = getServerFirebaseApp();
  dbInstance = getFirestore(app);
  return dbInstance;
}
