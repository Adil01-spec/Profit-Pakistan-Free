
"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { getAuth, Auth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import app from "./config";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

interface FirebaseContextValue {
  auth: Auth;
  firestore: Firestore;
  user: User | null;
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [user, setUser] = React.useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <FirebaseContext.Provider value={{ auth, firestore, user, isUserLoading }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
