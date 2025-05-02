import { initializeApp, getApps, FirebaseApp } from "firebase/app";
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

let app: FirebaseApp;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized on client");
  } catch (error) {
    console.error("Firebase client initialization error:", error);
    // Provide fallback dummy objects or handle the error appropriately
    // For now, we'll let db be potentially undefined and handle it where used
  }
}

// Function to get Firestore instance, especially for server-side usage if needed later
// Note: Server Actions run on the server, direct client-side SDK usage might be sufficient
// If server-side rendering or specific server functions need Firestore, initialize admin SDK separately.
const getDb = (): Firestore | null => {
  if (db) {
    return db;
  }
  // Re-initialize if called on the client and not initialized yet
  if (typeof window !== 'undefined' && !getApps().length) {
     try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("Firebase re-initialized on client");
      return db;
     } catch (error) {
       console.error("Firebase client re-initialization error:", error);
       return null;
     }
  }
   if (typeof window !== 'undefined' && getApps().length > 0) {
      app = getApps()[0];
      db = getFirestore(app);
      return db;
   }

  // If on server or failed initialization, return null
  console.warn("Firestore not available or not initialized correctly.");
  return null;
};


export { getDb };


// Helper function for server actions to initialize admin SDK if needed (example, not used currently)
// import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert, App as AdminApp } from 'firebase-admin/app';
// import { getFirestore as getAdminFirestore, Firestore as AdminFirestore } from 'firebase-admin/firestore';

// let adminApp: AdminApp;
// let adminDb: AdminFirestore;

// function initializeAdmin() {
//   if (!getAdminApps().length) {
//     try {
//       adminApp = initializeAdminApp({
//         credential: cert({
//           projectId: process.env.FIREBASE_PROJECT_ID,
//           clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//           privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//         }),
//       });
//       adminDb = getAdminFirestore(adminApp);
//       console.log("Firebase Admin SDK initialized");
//     } catch (error) {
//       console.error("Firebase Admin SDK initialization error:", error);
//     }
//   } else {
//      adminApp = getAdminApps()[0];
//      adminDb = getAdminFirestore(adminApp);
//   }
//   return { adminApp, adminDb };
// }

// export { initializeAdmin };