import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
      firebaseConfig.projectId &&
      firebaseConfig.projectId !== 'YOUR_PROJECT_ID' &&
      firebaseConfig.appId &&
      firebaseConfig.appId !== 'YOUR_APP_ID' &&
      firebaseConfig.authDomain &&
      firebaseConfig.authDomain !== 'YOUR_AUTH_DOMAIN' &&
      firebaseConfig.storageBucket &&
      firebaseConfig.storageBucket !== 'YOUR_STORAGE_BUCKET'
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('Firebase initialization notice (operating in local fallback mode):', error);
}

export { app, db, storage, auth };
