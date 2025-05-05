"use client";
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function initializeFirebaseClient(): void {
  console.log("initializing firebase client");
  console.log("typeof window:", typeof window);
  if (typeof window !== 'undefined') {
    console.log(getApps().length);
    if (!getApps().length) {
      try {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized on client");
      } catch (error) {
        console.error(error);
        console.log("Firebase client initialization error: app and db will be set to null");
        app = null;
        db = null;
      }
    } else {
      console.log("firebase already initialized");
      app = getApp();
      db = getFirestore(app);
    }
  }
}

const useFirebase = () => {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState<boolean>(false);

  useEffect(() => {
    initializeFirebaseClient();
    setIsFirebaseInitialized(true);
  }, []);

  return { isFirebaseInitialized };
};

export { useFirebase };