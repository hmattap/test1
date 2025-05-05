'use client';
import { getDb } from '@/lib/firebase';
import { useFirebase } from '@/hooks/useFirebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function MyDataDisplay() {
  const { isFirebaseInitialized } = useFirebase();
  const [myDoc, setMyDoc] = useState<any>(null);

  useEffect(() => {
    if (isFirebaseInitialized) {
      const db = getDb();
      if (!db) return;

      const getDocument = async () => {
        try {
          const document = doc(db, 'myCollection', 'myDoc');
          const myDocSnapshot = await getDoc(document);
          if (myDocSnapshot.exists()) {
            setMyDoc(myDocSnapshot.data());
          } else {
            setMyDoc('Document not found.');
          }
        } catch (error) {
          console.error(error);
        }
      };
      getDocument();
    }
  }, [isFirebaseInitialized]);

  return (
    <div>
      <h1>My Data</h1>
      {myDoc && typeof myDoc === 'object' && <p>{JSON.stringify(myDoc)}</p>}
      {myDoc === 'Document not found.' && <p>Document not found.</p>}
      {!myDoc && <p>Loading...</p>}
    </div>
  );
}