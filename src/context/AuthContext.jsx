// src/context/AuthContext.jsx
// ═══════════════════════════════════════════════════════════
// نظام مصادقة Firebase الرسمية (Firebase Authentication - 1-Tap Google Sign-In)
// دمج المصادقة المباشرة عبر حساب Google بضغطة زر واحدة (Firebase Authentication)
// الاعتماد الحصري على Native Google Sign-In و signInWithCredential لمنع فقدان الحالة الأولية
// ═══════════════════════════════════════════════════════════
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential, 
  onAuthStateChanged, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, db } from '../firebase/config';
import { INITIAL_USER } from '../data/mockData';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const GOOGLE_CLIENT_ID = '1068894096179-jmb60e6aoqd5m4mgq4sr6k5ee9hv5flq.apps.googleusercontent.com';
const OWNER_EMAIL = '888ssafaa@gmail.com';

const KEY_UID         = 'gm_uid';
const KEY_FULL_USER   = 'gm_user_profile';
const KEY_TEXT        = (uid) => `gm_text_${uid}`;
const KEY_AVATAR      = (uid) => `gm_avatar_${uid}`;
const KEY_COVER       = (uid) => `gm_cover_${uid}`;

const enforceRole = (profile, email) => ({
  ...profile,
  role: (email && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) ? 'APP_OWNER' : (profile?.role || 'REGULAR_USER'),
});

const isBase64 = (v) => typeof v === 'string' && (v.startsWith('data:') || v.length > 5000);

const jSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
};
const jGet = (key) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch (_) { return null; }
};
const lsSet = (key, val) => { try { localStorage.setItem(key, val); } catch (_) {} };
const lsGet = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
const lsDel = (...keys) => keys.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });

export const saveUserImages = (uid, profile) => {
  if (!uid || !profile) return;
  if (profile.avatar && isBase64(profile.avatar)) lsSet(KEY_AVATAR(uid), profile.avatar);
  if (profile.cover  && isBase64(profile.cover))  lsSet(KEY_COVER(uid),  profile.cover);
};

export const loadUserImages = (uid) => {
  const r = {};
  const av = lsGet(KEY_AVATAR(uid));
  const cv = lsGet(KEY_COVER(uid));
  if (av) r.avatar = av;
  if (cv) r.cover  = cv;
  return r;
};

const saveSessionProfile = (uid, profile) => {
  if (!uid || !profile) return;
  const cleanText = {};
  Object.entries(profile).forEach(([k, v]) => {
    if (!isBase64(v)) cleanText[k] = v;
  });

  jSet(KEY_FULL_USER, profile);
  jSet(KEY_TEXT(uid), cleanText);
  lsSet(KEY_UID, uid);

  saveUserImages(uid, profile);
};

const loadSessionProfile = () => {
  try {
    const full = jGet(KEY_FULL_USER);
    if (full && full.id) return full;
    const uid = lsGet(KEY_UID);
    if (!uid) return null;
    const text = jGet(KEY_TEXT(uid));
    if (!text) return null;
    const av = lsGet(KEY_AVATAR(uid));
    const cv = lsGet(KEY_COVER(uid));
    return { ...text, ...(av ? { avatar: av } : {}), ...(cv ? { cover: cv } : {}) };
  } catch (_) {
    return null;
  }
};

// ─── Firestore ──────────────────────────────────────────────
const fsLoad = async (uid) => {
  try {
    if (!uid || !db) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (_) { return null; }
};

const fsSave = (uid, profile) => {
  try {
    if (!uid || !db) return;
    const clean = {};
    Object.entries(profile).forEach(([k, v]) => {
      if (!isBase64(v) && v !== undefined) clean[k] = v;
    });
    setDoc(doc(db, 'users', uid), clean, { merge: true })
      .catch(e => console.warn('[Firestore] save failed:', e.code));
  } catch (_) {}
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => loadSessionProfile());
  const [loading, setLoading] = useState(true);
  const uidRef = useRef(user?.id || null);

  // ── 1. تفعيل الجلسة الدائمة واستمع لـ Firebase Auth ──────────────
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const uid = fbUser.uid;
        let fsData = await fsLoad(uid);
        let fullProfile;

        if (fsData) {
          fullProfile = enforceRole({
            ...fsData,
            ...loadUserImages(uid),
            id: uid,
            email: fbUser.email,
            name: fsData.name || fbUser.displayName || 'مستخدم',
            avatar: fsData.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
          }, fbUser.email);
        } else {
          fullProfile = enforceRole({
            ...INITIAL_USER,
            id: uid,
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
            avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
            cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
            governorate: 'بغداد',
            joinedDate: new Date().toLocaleDateString('ar-IQ'),
            bio: 'مستخدم مسجل عبر حساب Google المباشر'
          }, fbUser.email);

          fsSave(uid, fullProfile);
        }

        setUser(fullProfile);
        uidRef.current = uid;
        saveSessionProfile(uid, fullProfile);
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('auth_state_change'));
      } else {
        const local = loadSessionProfile();
        if (local) {
          setUser(local);
          uidRef.current = local.id;
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── login المباشر ─────────────────────────────────────────
  const login = (profileObj) => {
    const uid = profileObj?.id || `user_${Date.now()}`;
    const full = enforceRole({ ...profileObj, id: uid }, profileObj.email);
    setUser(full);
    uidRef.current = uid;
    saveSessionProfile(uid, full);
    fsSave(uid, full);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
    return full;
  };

  // ── 2. تسجيل الدخول عبر Google بضغطة زر واحدة ومنع "فقدان الحالة الأولية" ──
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence).catch(() => {});

      let fbUser = null;

      const isNative = Capacitor.isNativePlatform() || 
                       Capacitor.getPlatform() === 'android' || 
                       Capacitor.getPlatform() === 'ios' || 
                       Boolean(window.Capacitor?.isNative);

      // أ) الأجهزة المحمولة الأصيلة (Native Android APK / Capacitor)
      if (isNative) {
        try {
          GoogleAuth.initialize({
            clientId: GOOGLE_CLIENT_ID,
            scopes: ['profile', 'email'],
            grantOfflineAccess: true,
          });
          const googleUser = await GoogleAuth.signIn();
          const idToken = googleUser.authentication?.idToken || googleUser.idToken;
          if (idToken) {
            const credential = GoogleAuthProvider.credential(idToken);
            const res = await signInWithCredential(auth, credential);
            fbUser = res.user;
          }
        } catch (nErr) {
          console.warn('[Native GoogleAuth Warning]:', nErr);
        }
      }

      // ب) المتصفحات و WebView للهواتف المحمولة والكمبيوتر
      if (!fbUser) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
          const result = await signInWithPopup(auth, provider);
          fbUser = result.user;
        } catch (popupErr) {
          console.warn('[signInWithPopup Warning]:', popupErr.code, popupErr.message);

          // إذا ظهر خطأ فقدان الحالة الأولية auth/initial-state-not-found أو حظر النافذة
          // نمرر الـ Token مباشرة إلى signInWithCredential دون الحاجة لـ Popup أو Cookies!
          if (
            popupErr.code === 'auth/initial-state-not-found' ||
            popupErr.code === 'auth/popup-blocked' ||
            popupErr.code === 'auth/cancelled-popup-request'
          ) {
            const tokenResult = await new Promise((resolve, reject) => {
              if (window.google?.accounts?.oauth2) {
                const client = window.google.accounts.oauth2.initTokenClient({
                  client_id: GOOGLE_CLIENT_ID,
                  scope: 'email profile openid',
                  callback: (tokenRes) => {
                    if (tokenRes?.access_token) {
                      resolve({ accessToken: tokenRes.access_token });
                    } else {
                      reject(new Error('تعذر جلب رمز الدخول المباشر.'));
                    }
                  },
                });
                client.requestAccessToken();
              } else {
                reject(popupErr);
              }
            });

            if (tokenResult?.accessToken) {
              const credential = GoogleAuthProvider.credential(null, tokenResult.accessToken);
              const res = await signInWithCredential(auth, credential);
              fbUser = res.user;
            }
          } else {
            throw popupErr;
          }
        }
      }

      if (!fbUser) return null;

      const uid = fbUser.uid;
      let fsData = await fsLoad(uid);
      let fullProfile;

      if (fsData) {
        fullProfile = enforceRole({
          ...fsData,
          ...loadUserImages(uid),
          id: uid,
          email: fbUser.email,
          name: fsData.name || fbUser.displayName || 'مستخدم',
          avatar: fsData.avatar || fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
        }, fbUser.email);
      } else {
        fullProfile = enforceRole({
          ...INITIAL_USER,
          id: uid,
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'مستخدم',
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'G')}&background=1877F2&color=fff`,
          cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          governorate: 'بغداد',
          joinedDate: new Date().toLocaleDateString('ar-IQ'),
          bio: 'مستخدم مسجل عبر حساب Google المباشر'
        }, fbUser.email);

        fsSave(uid, fullProfile);
      }

      setUser(fullProfile);
      uidRef.current = uid;
      saveSessionProfile(uid, fullProfile);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('auth_state_change'));
      return fullProfile;

    } catch (error) {
      console.error('[Firebase Google Sign-In Error]:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── updateUser ───────────────────────────────────────────
  const updateUser = async (updatedFields) => {
    const uid = user?.id || uidRef.current;
    if (!uid) return null;
    const merged = enforceRole({ ...(user || {}), ...updatedFields, id: uid }, user?.email);

    setUser(merged);
    saveSessionProfile(uid, merged);
    fsSave(uid, merged);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
    return merged;
  };

  // ── logout ───────────────────────────────────────────────
  const logout = async () => {
    const uid = user?.id || uidRef.current;
    try {
      await signOut(auth);
    } catch (_) {}

    setUser(null);
    uidRef.current = null;
    lsDel(KEY_UID, KEY_FULL_USER);
    if (uid) {
      lsDel(KEY_TEXT(uid), KEY_AVATAR(uid), KEY_COVER(uid));
    }
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth_state_change'));
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser: user ? { uid: user.id, email: user.email } : null,
      loading,
      isLoggedIn: Boolean(user?.id),
      login,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
