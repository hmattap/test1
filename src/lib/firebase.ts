import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// IMPORTANT: Replace with your actual Firebase config values
// These should ideally be stored in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initializes the Firebase client SDK if running in a browser environment
 * and Firebase hasn't been initialized yet.
 */
function initializeFirebaseClient(): void {
  // Check if running in a browser environment
  if (typeof window !== 'undefined') {
    // Initialize only if no Firebase apps have been initialized yet
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized on client");
      } catch (error) {
        console.error("Firebase client initialization error:", error);
        // Reset app and db refs if initialization fails
        app = null;
        db = null;
      }
    } else {
      // If already initialized, get the default app instance
      app = getApp();
      db = getFirestore(app);
    }
  }
}

// Attempt to initialize Firebase on module load for client-side environments.
// This ensures Firebase is ready when components/hooks needing it are mounted.
initializeFirebaseClient();

/**
 * Gets the initialized Firestore instance.
 *
 * @returns The Firestore instance if initialized and available, otherwise null.
 */
const getDb = (): Firestore | null => {
  // Return the cached db instance if available.
  if (db) {
    return db;
  }

  // If running on the client and db is somehow not initialized yet
  // (e.g., module load timing issues), attempt to initialize again.
  // This serves as a fallback, but the initial call should ideally suffice.
  if (typeof window !== 'undefined') {
     initializeFirebaseClient();
     // Return the potentially (re)initialized db instance.
     // It might still be null if initialization failed.
     return db;
  }

  // If running on the server or initialization failed, log a warning and return null.
  // Server Actions running in Node.js context cannot use the client SDK directly like this.
  // They typically require the Firebase Admin SDK for server-side operations.
  console.warn("Firestore is not available. Ensure Firebase is initialized correctly on the client, or use Admin SDK for server-side operations.");
  return null;
};

export { getDb };


// Example for initializing Admin SDK (commented out, not currently used):
// import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert, App as AdminApp } from 'firebase-admin/app';
// import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';
//
// let adminApp: AdminApp | null = null;
// let adminDb: AdminFirestore | null = null;
//
// function initializeAdmin() {
//   // Ensure this runs only on the server
//   if (typeof window === 'undefined' && !getAdminApps().length) {
//     try {
//       // Ensure environment variables are set for Admin SDK credentials
//       const serviceAccount = {
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       };
//       if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
//         throw new Error('Firebase Admin SDK credentials are not configured in environment variables.');
//       }
//
//       adminApp = initializeAdminApp({ credential: cert(serviceAccount) });
//       adminDb = getAdminFirestore(adminApp);
//       console.log("Firebase Admin SDK initialized");
//     } catch (error) {
//       console.error("Firebase Admin SDK initialization error:", error);
//       adminApp = null;
//       adminDb = null;
//     }
//   } else if (getAdminApps().length > 0) {
//      adminApp = getAdminApps()[0];
//      adminDb = getAdminFirestore(adminApp!);
//   }
//   return { adminApp, adminDb };
// }
//
// // Call initializeAdmin() early in server-side processes if needed
// // export { initializeAdmin, adminDb };
