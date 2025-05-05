// src/lib/firebase.ts
import { getFirestore, Firestore } from "firebase/firestore";

let db: Firestore | null = null;

/**
 * Gets the initialized Firestore instance.
 *
 * @returns The Firestore instance if initialized and available, otherwise null.
 */
const getDb = (): Firestore | null => {
    console.log("getDb() called");
    // Return the cached db instance if available.
    if (db) {
        console.log("db:", db);
        return db;
    }
    console.warn("Firestore is not available. Ensure Firebase is initialized correctly on the client.");
    return null;
};

export { getDb };