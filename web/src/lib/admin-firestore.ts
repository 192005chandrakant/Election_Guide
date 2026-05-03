/**
 * Server-side Firestore access using Firebase Admin SDK.
 * This bypasses security rules and is safe for Node.js runtime (Next.js API routes).
 * Uses the service account key from the root of the project.
 */

import * as admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";
import * as path from "path";

let adminApp: admin.app.App | null = null;
let dbInstance: Firestore | null = null;

function getAdminApp(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  if (admin.apps.length > 0) {
    adminApp = admin.apps[0];
    return adminApp;
  }

  // Service account key is expected at the root of the project
  const serviceAccountPath = path.join(
    process.cwd(),
    "..",
    "promptwar-cddf1-firebase-adminsdk-fbsvc-5e7ba833f3.json"
  );

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  return adminApp;
}

export function getAdminFirestore(): Firestore {
  if (dbInstance) {
    return dbInstance;
  }

  const app = getAdminApp();
  dbInstance = admin.firestore(app);
  return dbInstance;
}
