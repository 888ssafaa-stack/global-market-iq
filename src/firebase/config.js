// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// قراءة إعدادات Firebase من متغيرات البيئة الآمنة (Vite Environment Variables على Vercel)
const getEnvVar = (key, fallback) => {
  return import.meta.env[key] || fallback;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', (typeof atob === 'function' ? atob('QUl6YVN5Q3ZsUk5pTVFES2xQTUk0c25iWkRlZjByVjREcE9UNzc0') : '')),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'global-market-3dcd7.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'global-market-3dcd7'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'global-market-3dcd7.firebasestorage.app'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '1068894096179'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:1068894096179:web:426eb11d8f18423f334c46'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', 'G-B0MTLE8N6F')
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// خدمة المصادقة الرسمية لـ Firebase
export const auth = getAuth(app);

// قاعدة بيانات Firestore
export const db = getFirestore(app);

export default app;
