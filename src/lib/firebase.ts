import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfCxTL3F5NxkLFMc8_Vib0lMNozZ751c4",
  authDomain: "mrmclselection.firebaseapp.com",
  projectId: "mrmclselection",
  storageBucket: "mrmclselection.firebasestorage.app",
  messagingSenderId: "957431635288",
  appId: "1:957431635288:web:87bc075cd3d0a25436992d",
  measurementId: "G-WJY20VECM8"
};

// Initialize Firebase (prevent double-init in dev hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
