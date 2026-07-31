// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "REMOVED_FIREBASE_KEY",
  authDomain: "global-market-3dcd7.firebaseapp.com",
  projectId: "global-market-3dcd7",
  storageBucket: "global-market-3dcd7.firebasestorage.app",
  messagingSenderId: "1068894096179",
  appId: "1:1068894096179:web:426eb11d8f18423f334c46",
  measurementId: "G-B0MTLE8N6F"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// خدمة المصادقة الرسمية لـ Firebase
export const auth = getAuth(app);

// قاعدة بيانات Firestore
export const db = getFirestore(app);

export default app;
