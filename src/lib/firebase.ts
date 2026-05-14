import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigFromJson from '../../firebase-applet-config.json';

// Support both environment variables (standard for Vercel/Production) 
// and the local config file (AI Studio default).
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigFromJson.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFromJson.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFromJson.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFromJson.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFromJson.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigFromJson.appId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigFromJson.measurementId,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || (firebaseConfigFromJson as any).firestoreDatabaseId,
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "PLACEHOLDER";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

// Force session persistence to local
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Persistence error", err);
});

export { auth };
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const storage = getStorage(app);
export { isConfigured };

export default app;
