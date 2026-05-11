import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// In AI Studio, the config is injected during the set_up_firebase tool call.
// We provide dummy values to prevent crashes if the tool hasn't finished successfully.
import firebaseConfig from '../../firebase-applet-config.json';

const isConfigured = firebaseConfig.apiKey !== "PLACEHOLDER";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 
export const storage = getStorage(app);
export { isConfigured };

export default app;
