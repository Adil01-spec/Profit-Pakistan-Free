import { collection, addDoc, getDocs, doc, getDoc, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { HistoryRecord, LaunchPlan, FeasibilityCheck } from './types';

export const addHistoryRecord = async (
  userId: string,
  record: Omit<LaunchPlan, 'id' | 'userId' | 'date'> | Omit<FeasibilityCheck, 'id' | 'userId' | 'date'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, `users/${userId}/history`), {
    ...record,
    date: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserHistory = async (userId: string): Promise<HistoryRecord[]> => {
  const q = query(collection(db, `users/${userId}/history`), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return { 
        ...data, 
        id: doc.id,
        date: (data.date as Timestamp)?.toDate().toISOString() || new Date().toISOString()
    } as HistoryRecord;
  });
};

export const getHistoryRecord = async (userId: string, recordId: string): Promise<HistoryRecord | null> => {
    const docRef = doc(db, `users/${userId}/history`, recordId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            ...data,
            id: docSnap.id,
            date: (data.date as Timestamp)?.toDate().toISOString() || new Date().toISOString()
        } as HistoryRecord;
    } else {
        return null;
    }
}
