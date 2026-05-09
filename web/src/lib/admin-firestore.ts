/**
 * Server-side Firestore access using Firebase Admin SDK.
 * This bypasses security rules and is safe for Node.js runtime (Next.js API routes).
 * Uses the service account key from the root of the project.
 */

import * as admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";
import * as path from "path";
import * as fs from "fs";

let adminApp: admin.app.App | null = null;
let dbInstance: Firestore | null = null;

function getAdminApp(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  if (admin.apps.length > 0) {
    const existingApp = admin.apps[0];
    if (!existingApp) {
      throw new Error("Firebase Admin app list was populated but no app instance was available.");
    }

    adminApp = existingApp;
    return existingApp;
  }

  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const candidatePaths = [
    configuredPath,
    path.join(process.cwd(), "serviceAccountKey.json"),
    path.join(process.cwd(), "promptwar-cddf1-firebase-adminsdk-fbsvc-5e7ba833f3.json"),
    path.join(process.cwd(), "..", "serviceAccountKey.json"),
    path.join(process.cwd(), "..", "promptwar-cddf1-firebase-adminsdk-fbsvc-5e7ba833f3.json"),
  ].filter((value): value is string => Boolean(value));

  const serviceAccountPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));
  if (!serviceAccountPath) {
    throw new Error(
      "Firebase service account key not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or place a key file in the project root."
    );
  }

  const serviceAccountInfo = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8").replace(/^\uFEFF/, "")
  );

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountInfo),
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
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
