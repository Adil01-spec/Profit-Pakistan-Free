
"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { getAuth, Auth, User } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import app from "./config";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

interface FirebaseContextValue {
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null; // Keep user for type consistency, but it will be null
  isUserLoading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  // Initialize services only if the app object is valid
  const auth = app ? getAuth(app) : null;
  const firestore = app ? getFirestore(app) : null;

  // Since we removed authentication, user is always null and loading is false.
  const user = null;
  const isUserLoading = false;

  // If app is not configured, you might want to render a specific message
  // or nothing, instead of letting children components fail.
  if (!app) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="rounded-md border-2 border-destructive/50 bg-destructive/10 p-6 text-center">
            <h1 className="text-xl font-bold text-destructive">Firebase Not Configured</h1>
            <p className="mt-2 text-sm">Please add your Firebase credentials to the <code>.env</code> file and restart the server.</p>
        </div>
      </div>
    );
  }

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
