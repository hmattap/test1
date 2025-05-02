import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length > 0) {
        adminApp = getApps()[0];
    } else {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          };
          if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
            throw new Error('Firebase Admin SDK credentials are not configured in environment variables.');
          }
        adminApp = initializeApp({ credential: cert(serviceAccount) });
    }
  }
  return adminApp;
}

function getAdminDb(): Firestore {
  if (!adminDb) {
      adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}

export { getAdminApp, getAdminDb };