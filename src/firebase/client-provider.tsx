
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { UsageProvider } from '@/hooks/use-usage';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    if (typeof window === 'undefined') {
      return { firebaseApp: null, firestore: null, auth: null };
    }
    return initializeFirebase();
  }, []);

  if (!firebaseServices.firebaseApp || !firebaseServices.auth || !firebaseServices.firestore) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <UsageProvider auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
        {children}
      </UsageProvider>
    </FirebaseProvider>
  );
}
